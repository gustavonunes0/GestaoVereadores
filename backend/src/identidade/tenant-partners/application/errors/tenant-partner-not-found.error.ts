export class TenantPartnerNotFoundError extends Error {
    constructor(id: string) {
        super(`Parceiro externo não encontrado: ${id}`);
        this.name = 'TenantPartnerNotFoundError';
    }
}
