import { Inject, Injectable } from '@nestjs/common';
import { PasswordHasher } from '../../../identidade/users/application/contracts/password-hasher';
import { PASSWORD_HASHER } from '../../../identidade/users/users.tokens';
import { TokenIssuer } from '../../domain/contracts/token-issuer';
import { CamaraAuthRepository } from '../../domain/repositories/camara-auth.repository';
import { TenantAuthRepository } from '../../domain/repositories/tenant-auth.repository';
import {
    AuthDomainService,
    InvalidCredentialsDomainError,
    TenantMembershipRequiredDomainError,
} from '../../domain/services/auth-domain.service';
import {
    TenantNotFoundDomainError,
    TenantResolutionRequiredDomainError,
    TenantResolutionService,
} from '../../domain/services/tenant-resolution.service';
import {
    ParlamentarianJwtPayload,
    StaffJwtPayload,
} from '../../domain/types/jwt-payload.type';
import { LoginCamaraDto } from '../dto/login-camara.dto';
import {
    InvalidCredentialsError,
    InvalidTenantError,
    TenantMembershipRequiredError,
    TenantResolutionRequiredError,
} from '../errors/auth.errors';
import { AuthSessionViewModel } from '../view-models/auth-session.view-model';

@Injectable()
export class LoginCamaraUseCase {
    private readonly domainService: AuthDomainService =
        new AuthDomainService();
    private readonly tenantResolution: TenantResolutionService =
        new TenantResolutionService();

    constructor(
        private readonly camaraAuth: CamaraAuthRepository,
        private readonly tenants: TenantAuthRepository,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
        private readonly tokenIssuer: TokenIssuer,
    ) {}

    private normalizeCpf(value: string): string {
        return value.replace(/\D/g, '');
    }

    async execute(dto: LoginCamaraDto) {
        const email = dto.email?.trim().toLowerCase();
        const cpf = dto.cpf ? this.normalizeCpf(dto.cpf) : undefined;
        const user = email
            ? await this.camaraAuth.findUserByEmail(email)
            : cpf
              ? await this.camaraAuth.findUserByCpf(cpf)
              : null;

        try {
            this.domainService.assertCamaraUserExists(user);
        } catch (error) {
            if (error instanceof InvalidCredentialsDomainError) {
                throw new InvalidCredentialsError();
            }
            throw error;
        }

        const isPartnerOnly = await this.camaraAuth.isPartnerOnlyUser(user.id);
        if (isPartnerOnly) {
            throw new InvalidCredentialsError();
        }

        const valid = await this.passwordHasher.compare(
            dto.password,
            user.passwordHash,
        );

        try {
            this.domainService.assertPasswordMatches(valid);
        } catch (error) {
            if (error instanceof InvalidCredentialsDomainError) {
                throw new InvalidCredentialsError();
            }
            throw error;
        }

        let tenant;

        if (dto.tenantId || dto.tenantCnpj) {
            try {
                tenant = await this.tenantResolution.resolveCamaraTenant(
                    dto.tenantId,
                    dto.tenantCnpj,
                    this.tenants,
                );
            } catch (error) {
                if (error instanceof TenantNotFoundDomainError) {
                    throw new InvalidTenantError(error.message);
                }
                if (error instanceof TenantResolutionRequiredDomainError) {
                    throw new TenantResolutionRequiredError();
                }
                throw error;
            }

            // Verificar ParlamentarianUser primeiro
            const parlUser = await this.camaraAuth.findActiveParlamentarianUser(
                user.id,
                tenant.id,
            );
            if (parlUser) {
                await this.camaraAuth.touchParlamentarianLastAccess(parlUser.id);
                const payload: ParlamentarianJwtPayload = {
                    sessionType: 'parliamentarian',
                    sub: user.id,
                    tenantId: parlUser.tenantId,
                    parliamentarianUserId: parlUser.id,
                    parliamentarianId: parlUser.parliamentarianId,
                    parliamentaryName: parlUser.parliamentaryName,
                };
                return AuthSessionViewModel.camaraParliamentarian(
                    user,
                    tenant,
                    parlUser,
                    this.tokenIssuer.sign(payload),
                );
            }

            // Fallback para TenantUser (servidor)
            const tenantUser = await this.camaraAuth.findActiveTenantUser(
                user.id,
                tenant.id,
            );

            try {
                this.domainService.assertActiveTenantMembership(tenantUser);
            } catch (error) {
                if (error instanceof TenantMembershipRequiredDomainError) {
                    throw new TenantMembershipRequiredError();
                }
                throw error;
            }

            await this.camaraAuth.touchLastAccess(tenantUser.id);
            const payload: StaffJwtPayload = {
                sessionType: 'staff',
                sub: user.id,
                tenantId: tenantUser.tenantId,
                tenantUserId: tenantUser.id,
                role: tenantUser.role,
            };
            return AuthSessionViewModel.camaraStaff(
                user,
                tenant,
                tenantUser,
                this.tokenIssuer.sign(payload),
            );
        } else {
            // Sem tenantId: buscar primeiro ParlamentarianUser disponível
            const parlUser =
                await this.camaraAuth.findFirstActiveParlamentarianUser(user.id);

            if (parlUser) {
                const parlTenant = await this.tenants.findActiveById(
                    parlUser.tenantId,
                );
                if (!parlTenant) {
                    throw new InvalidTenantError('Câmara inválida ou inativa');
                }
                await this.camaraAuth.touchParlamentarianLastAccess(parlUser.id);
                const payload: ParlamentarianJwtPayload = {
                    sessionType: 'parliamentarian',
                    sub: user.id,
                    tenantId: parlUser.tenantId,
                    parliamentarianUserId: parlUser.id,
                    parliamentarianId: parlUser.parliamentarianId,
                    parliamentaryName: parlUser.parliamentaryName,
                };
                return AuthSessionViewModel.camaraParliamentarian(
                    user,
                    parlTenant,
                    parlUser,
                    this.tokenIssuer.sign(payload),
                );
            }

            // Fallback para TenantUser
            const tenantUser =
                await this.camaraAuth.findFirstActiveTenantUser(user.id);

            if (!tenantUser) {
                throw new TenantMembershipRequiredError();
            }

            tenant = await this.tenants.findActiveById(tenantUser.tenantId);
            if (!tenant) {
                throw new InvalidTenantError('Câmara inválida ou inativa');
            }

            try {
                this.domainService.assertActiveTenantMembership(tenantUser);
            } catch (error) {
                if (error instanceof TenantMembershipRequiredDomainError) {
                    throw new TenantMembershipRequiredError();
                }
                throw error;
            }

            await this.camaraAuth.touchLastAccess(tenantUser.id);
            const payload: StaffJwtPayload = {
                sessionType: 'staff',
                sub: user.id,
                tenantId: tenantUser.tenantId,
                tenantUserId: tenantUser.id,
                role: tenantUser.role,
            };
            return AuthSessionViewModel.camaraStaff(
                user,
                tenant,
                tenantUser,
                this.tokenIssuer.sign(payload),
            );
        }
    }
}
