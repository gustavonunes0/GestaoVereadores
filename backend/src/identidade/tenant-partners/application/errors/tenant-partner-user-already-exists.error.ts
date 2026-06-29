export class TenantPartnerUserAlreadyExistsError extends Error {
    constructor() {
        super('Esta instituição parceira já possui usuário vinculado.');
        this.name = 'TenantPartnerUserAlreadyExistsError';
    }
}
