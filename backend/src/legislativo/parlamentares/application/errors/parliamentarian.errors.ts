export class ParliamentarianNotFoundError extends Error {
    constructor() {
        super('Parlamentar não encontrado');
        this.name = 'ParliamentarianNotFoundError';
    }
}

export class ParliamentarianAlreadyExistsError extends Error {
    constructor() {
        super('Já existe parlamentar para este usuário do tenant');
        this.name = 'ParliamentarianAlreadyExistsError';
    }
}

export class TenantUserNotParliamentarianError extends Error {
    constructor() {
        super('Este usuário do tenant não está marcado como parlamentar.');
        this.name = 'TenantUserNotParliamentarianError';
    }
}

export class TenantUserNotFoundForParliamentarianError extends Error {
    constructor() {
        super('Usuário do tenant não encontrado');
        this.name = 'TenantUserNotFoundForParliamentarianError';
    }
}

export class PoliticalPartyNotFoundForParliamentarianError extends Error {
    constructor() {
        super('Partido político não encontrado');
        this.name = 'PoliticalPartyNotFoundForParliamentarianError';
    }
}

export class PoliticalPartyRemovedForParliamentarianError extends Error {
    constructor() {
        super('Partido político removido não pode ser utilizado');
        this.name = 'PoliticalPartyRemovedForParliamentarianError';
    }
}
