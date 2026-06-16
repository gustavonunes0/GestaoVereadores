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
import { JwtPayload } from '../../domain/types/jwt-payload.type';
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

        let tenantUser;
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

            tenantUser = await this.camaraAuth.findActiveTenantUser(
                user.id,
                tenant.id,
            );
        } else {
            tenantUser = await this.camaraAuth.findFirstActiveTenantUser(
                user.id,
            );

            if (!tenantUser) {
                throw new TenantMembershipRequiredError();
            }

            tenant = await this.tenants.findActiveById(tenantUser.tenantId);
            if (!tenant) {
                throw new InvalidTenantError('Câmara inválida ou inativa');
            }
        }

        try {
            this.domainService.assertActiveTenantMembership(tenantUser);
        } catch (error) {
            if (error instanceof TenantMembershipRequiredDomainError) {
                throw new TenantMembershipRequiredError();
            }
            throw error;
        }

        const payload: JwtPayload = {
            sub: user.id,
            authType: 'camara',
            tid: tenant.id,
            tenantUserId: tenantUser.id,
            tenantUserRole: tenantUser.role,
            parliamentarianId: tenantUser.parliamentarianId,
            isTenantAdmin: tenantUser.isTenantAdmin,
            isTenantStaff: tenantUser.isTenantStaff,
            isParliamentarian: tenantUser.isParliamentarian,
            isAdmin: tenantUser.isTenantAdmin,
        };

        await this.camaraAuth.touchLastAccess(tenantUser.id);

        return AuthSessionViewModel.camara(
            user,
            tenant,
            tenantUser,
            this.tokenIssuer.sign(payload),
        );
    }
}
