import { CamaraUserEntity } from '../../domain/entities/camara-user.entity';
import { SiglUserEntity } from '../../domain/entities/sigl-user.entity';
import { TenantAuthEntity } from '../../domain/entities/tenant-access.entity';
import { TenantUserAccessEntity } from '../../domain/entities/tenant-access.entity';

export class AuthSessionViewModel {
    static sigl(
        user: SiglUserEntity,
        tenantId: string | undefined,
        accessToken: string,
    ) {
        return {
            access_token: accessToken,
            user: {
                id: user.id,
                username: user.username,
                nome: user.nome,
                role: user.role,
                tenantId,
                authType: 'sigl' as const,
            },
        };
    }

    static camara(
        user: CamaraUserEntity,
        tenant: TenantAuthEntity,
        tenantUser: TenantUserAccessEntity,
        accessToken: string,
    ) {
        return {
            access_token: accessToken,
            user: {
                id: user.id,
                email: user.email,
                nome: user.fullName(),
                tenantId: tenant.id,
                tenantName: tenant.name,
                isTenantAdmin: tenantUser.isTenantAdmin,
                isTenantStaff: tenantUser.isTenantStaff,
                isParliamentarian: tenantUser.isParliamentarian,
                authType: 'camara' as const,
            },
        };
    }

    static siglProfile(profile: {
        id: string;
        username: string;
        nome: string;
        role: SiglUserEntity['role'];
        ativo: boolean;
    }) {
        return { ...profile, authType: 'sigl' as const };
    }

    static camaraProfile(profile: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    }) {
        return {
            id: profile.id,
            email: profile.email,
            nome: `${profile.firstName} ${profile.lastName}`.trim(),
            authType: 'camara' as const,
        };
    }
}
