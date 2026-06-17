import { CamaraUserEntity } from '../entities/camara-user.entity';
import {
    ParlamentarianUserAccessEntity,
    TenantUserAccessEntity,
} from '../entities/tenant-access.entity';

export type CamaraUserProfile = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    cpf: string;
};

export abstract class CamaraAuthRepository {
    abstract findUserByEmail(email: string): Promise<CamaraUserEntity | null>;
    abstract findUserByCpf(cpf: string): Promise<CamaraUserEntity | null>;

    abstract findProfileById(id: string): Promise<CamaraUserProfile | null>;

    abstract findActiveTenantUser(
        userId: string,
        tenantId: string,
    ): Promise<TenantUserAccessEntity | null>;
    abstract findFirstActiveTenantUser(
        userId: string,
    ): Promise<TenantUserAccessEntity | null>;

    abstract findActiveParlamentarianUser(
        userId: string,
        tenantId: string,
    ): Promise<ParlamentarianUserAccessEntity | null>;
    abstract findFirstActiveParlamentarianUser(
        userId: string,
    ): Promise<ParlamentarianUserAccessEntity | null>;

    abstract touchLastAccess(tenantUserId: string): Promise<void>;
    abstract touchParlamentarianLastAccess(parliamentarianUserId: string): Promise<void>;
}
