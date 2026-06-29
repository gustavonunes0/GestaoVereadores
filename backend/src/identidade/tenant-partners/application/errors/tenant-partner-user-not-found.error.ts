export class TenantPartnerUserNotFoundError extends Error {
    constructor() {
        super('Usuário vinculado não encontrado para esta instituição.');
        this.name = 'TenantPartnerUserNotFoundError';
    }
}
