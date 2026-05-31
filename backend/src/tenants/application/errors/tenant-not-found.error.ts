export class TenantNotFoundError extends Error {
    constructor(tenantId: string) {
        super(`Tenant com id ${tenantId} não foi encontrado`);
    }
}
