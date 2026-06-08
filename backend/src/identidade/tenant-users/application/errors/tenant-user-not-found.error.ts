export class TenantUserNotFoundError extends Error {
    constructor(tenantUserId: string) {
        super(`Vínculo tenant-user com id ${tenantUserId} não foi encontrado`);
    }
}
