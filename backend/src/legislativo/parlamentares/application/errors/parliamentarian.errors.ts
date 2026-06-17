export class ParliamentarianNotFoundError extends Error {
    constructor() {
        super('Parlamentar não encontrado');
        this.name = 'ParliamentarianNotFoundError';
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

export class ParliamentarianCpfAlreadyInUseError extends Error {
    constructor() {
        super('Já existe um usuário cadastrado com este CPF');
        this.name = 'ParliamentarianCpfAlreadyInUseError';
    }
}
