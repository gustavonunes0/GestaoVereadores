import { CamaraUserEntity } from '../../domain/entities/camara-user.entity';
import {
    ParlamentarianUserAccessEntity,
    TenantAuthEntity,
    TenantUserAccessEntity,
} from '../../domain/entities/tenant-access.entity';

export class AuthSessionViewModel {
    static camaraStaff(
        user: CamaraUserEntity,
        tenant: TenantAuthEntity,
        tenantUser: TenantUserAccessEntity,
        accessToken: string,
    ) {
        return {
            access_token: accessToken,
            sessionType: 'staff' as const,
            user: {
                id: user.id,
                name: user.fullName(),
                cpf: user.cpf,
                email: user.email,
                tenantId: tenant.id,
                tenantName: tenant.name,
                tenantLogo: tenant.logo,
                tenantUserId: tenantUser.id,
                role: tenantUser.role,
                sessionType: 'staff' as const,
            },
        };
    }

    static camaraParliamentarian(
        user: CamaraUserEntity,
        tenant: TenantAuthEntity,
        parlUser: ParlamentarianUserAccessEntity,
        accessToken: string,
    ) {
        return {
            access_token: accessToken,
            sessionType: 'parliamentarian' as const,
            user: {
                id: user.id,
                name: user.fullName(),
                cpf: user.cpf,
                email: user.email,
                tenantId: tenant.id,
                tenantName: tenant.name,
                tenantLogo: tenant.logo,
                parliamentarianUserId: parlUser.id,
                parliamentarianId: parlUser.parliamentarianId,
                parliamentaryName: parlUser.parliamentaryName,
                sessionType: 'parliamentarian' as const,
            },
        };
    }

    static platformAdmin(user: CamaraUserEntity, accessToken: string) {
        return {
            access_token: accessToken,
            sessionType: 'platform' as const,
            user: {
                id: user.id,
                name: user.fullName(),
                cpf: user.cpf,
                email: user.email,
                sessionType: 'platform' as const,
                isPlatformAdmin: true,
            },
        };
    }

    static platformAdminMe(profile: {
        id: string;
        name: string;
        cpf: string | null;
        email: string;
    }) {
        return {
            id: profile.id,
            name: profile.name,
            cpf: profile.cpf,
            email: profile.email,
            sessionType: 'platform' as const,
            isPlatformAdmin: true,
        };
    }

    static camaraParliamentarianMe(profile: {
        id: string;
        name: string;
        cpf: string | null;
        email: string;
        tenantId: string;
        tenantName?: string;
        tenantLogo?: string | null;
        parliamentarianUserId: string;
        parliamentarianId: string;
        parliamentaryName: string;
    }) {
        return {
            id: profile.id,
            name: profile.name,
            cpf: profile.cpf,
            email: profile.email,
            tenantId: profile.tenantId,
            ...(profile.tenantName ? { tenantName: profile.tenantName } : {}),
            ...(profile.tenantLogo ? { tenantLogo: profile.tenantLogo } : {}),
            parliamentarianUserId: profile.parliamentarianUserId,
            parliamentarianId: profile.parliamentarianId,
            parliamentaryName: profile.parliamentaryName,
            sessionType: 'parliamentarian' as const,
        };
    }

    static camaraStaffMe(profile: {
        id: string;
        name: string;
        cpf: string | null;
        email: string;
        tenantId: string;
        tenantName?: string;
        tenantLogo?: string | null;
        tenantUserId: string;
        role: TenantUserAccessEntity['role'];
    }) {
        return {
            id: profile.id,
            name: profile.name,
            cpf: profile.cpf,
            email: profile.email,
            tenantId: profile.tenantId,
            ...(profile.tenantName ? { tenantName: profile.tenantName } : {}),
            ...(profile.tenantLogo ? { tenantLogo: profile.tenantLogo } : {}),
            tenantUserId: profile.tenantUserId,
            role: profile.role,
            sessionType: 'staff' as const,
        };
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
