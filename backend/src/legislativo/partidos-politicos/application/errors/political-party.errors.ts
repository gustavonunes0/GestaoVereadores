export class PoliticalPartyNotFoundError extends Error {
    constructor() {
        super('Partido político não encontrado');
        this.name = 'PoliticalPartyNotFoundError';
    }
}

export class PoliticalPartyAcronymAlreadyInUseError extends Error {
    constructor() {
        super('Já existe partido político com esta sigla');
        this.name = 'PoliticalPartyAcronymAlreadyInUseError';
    }
}

export class PoliticalPartyNameAlreadyInUseError extends Error {
    constructor() {
        super('Já existe partido político com este nome');
        this.name = 'PoliticalPartyNameAlreadyInUseError';
    }
}

export class PoliticalPartyHasActiveParliamentariansError extends Error {
    constructor() {
        super(
            'Não é possível remover partido político vinculado a parlamentares ativos.',
        );
        this.name = 'PoliticalPartyHasActiveParliamentariansError';
    }
}
