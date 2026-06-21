import { CamaraUserEntity } from '../../domain/entities/camara-user.entity';
import { SiglUserEntity } from '../../domain/entities/sigl-user.entity';
import {
    ParlamentarianUserAccessEntity,
    TenantAuthEntity,
    TenantUserAccessEntity,
} from '../../domain/entities/tenant-access.entity';

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
                parliamentarianUserId: parlUser.id,
                parliamentarianId: parlUser.parliamentarianId,
                parliamentaryName: parlUser.parliamentaryName,
                sessionType: 'parliamentarian' as const,
            },
        };
    }

    static camaraParliamentarianMe(profile: {
        id: string;
        name: string;
        cpf: string | null;
        email: string;
        tenantId: string;
        tenantName?: string;
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
            tenantUserId: profile.tenantUserId,
            role: profile.role,
            sessionType: 'staff' as const,
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
