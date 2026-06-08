export class TenantUserHasActiveParliamentarianError extends Error {
    constructor() {
        super(
            'Não é possível remover usuário do tenant com perfil parlamentar ativo.',
        );
        this.name = 'TenantUserHasActiveParliamentarianError';
    }
}
