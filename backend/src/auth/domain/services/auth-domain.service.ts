import { CamaraUserEntity } from '../entities/camara-user.entity';
import { TenantUserAccessEntity } from '../entities/tenant-access.entity';

export class InvalidCredentialsDomainError extends Error {
    constructor() {
        super('Credenciais inválidas');
        this.name = 'InvalidCredentialsDomainError';
    }
}

export class TenantMembershipRequiredDomainError extends Error {
    constructor() {
        super('Usuário sem vínculo ativo nesta câmara');
        this.name = 'TenantMembershipRequiredDomainError';
    }
}

export class AuthDomainService {
    assertCamaraUserExists(
        user: CamaraUserEntity | null,
    ): asserts user is CamaraUserEntity {
        if (!user) {
            throw new InvalidCredentialsDomainError();
        }
    }

    assertPasswordMatches(valid: boolean): void {
        if (!valid) {
            throw new InvalidCredentialsDomainError();
        }
    }

    assertActiveTenantMembership(
        tenantUser: TenantUserAccessEntity | null,
    ): asserts tenantUser is TenantUserAccessEntity {
        if (!tenantUser) {
            throw new TenantMembershipRequiredDomainError();
        }
    }
}
