import { Injectable } from '@nestjs/common';
import { TokenIssuer } from '../../domain/contracts/token-issuer';
import { SiglPasswordHasher } from '../../domain/contracts/sigl-password.hasher';
import { SiglUserRepository } from '../../domain/repositories/sigl-user.repository';
import { TenantAuthRepository } from '../../domain/repositories/tenant-auth.repository';
import {
    AuthDomainService,
    InvalidCredentialsDomainError,
} from '../../domain/services/auth-domain.service';
import {
    TenantNotFoundDomainError,
    TenantResolutionService,
} from '../../domain/services/tenant-resolution.service';
import { JwtPayload } from '../../domain/types/jwt-payload.type';
import { LoginDto } from '../dto/login.dto';
import {
    InvalidCredentialsError,
    InvalidTenantError,
} from '../errors/auth.errors';
import { AuthSessionViewModel } from '../view-models/auth-session.view-model';

@Injectable()
export class LoginSiglUseCase {
    private readonly domainService: AuthDomainService =
        new AuthDomainService();
    private readonly tenantResolution: TenantResolutionService =
        new TenantResolutionService();

    constructor(
        private readonly siglUsers: SiglUserRepository,
        private readonly tenants: TenantAuthRepository,
        private readonly passwordHasher: SiglPasswordHasher,
        private readonly tokenIssuer: TokenIssuer,
    ) {}

    async execute(dto: LoginDto) {
        if (!dto.username) {
            throw new InvalidCredentialsError();
        }
        const user = await this.siglUsers.findByUsername(dto.username);

        try {
            this.domainService.assertSiglUserCanLogin(user);
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

        let tid: string | undefined;
        try {
            tid = await this.tenantResolution.resolveOptionalTenantId(
                dto.tenantId,
                this.tenants,
            );
        } catch (error) {
            if (error instanceof TenantNotFoundDomainError) {
                throw new InvalidTenantError(error.message);
            }
            throw error;
        }

        const payload: JwtPayload = {
            sub: user.id,
            authType: 'sigl',
            username: user.username,
            role: user.role,
            tid,
        };

        return AuthSessionViewModel.sigl(
            user,
            tid,
            this.tokenIssuer.sign(payload),
        );
    }
}
