import { CamaraUserEntity } from '../entities/camara-user.entity';
import { TenantUserAccessEntity } from '../entities/tenant-access.entity';

export type CamaraUserProfile = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
};

export abstract class CamaraAuthRepository {
    abstract findUserByEmail(email: string): Promise<CamaraUserEntity | null>;

    abstract findProfileById(id: string): Promise<CamaraUserProfile | null>;

    abstract findActiveTenantUser(
        userId: string,
        tenantId: string,
    ): Promise<TenantUserAccessEntity | null>;

    abstract touchLastAccess(tenantUserId: string): Promise<void>;
}
