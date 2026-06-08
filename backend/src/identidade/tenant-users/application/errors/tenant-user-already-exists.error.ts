export class TenantUserAlreadyExistsError extends Error {
    constructor(tenantId: string, userId: string) {
        super(`O usuário ${userId} já possui vínculo com o tenant ${tenantId}`);
    }
}
