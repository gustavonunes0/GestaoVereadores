export class LegislatureNotFoundError extends Error {
    constructor() {
        super('Legislatura não encontrada');
        this.name = 'LegislatureNotFoundError';
    }
}

export class LegislatureNumberAlreadyInUseError extends Error {
    constructor() {
        super('Já existe legislatura com este número');
        this.name = 'LegislatureNumberAlreadyInUseError';
    }
}

export class LegislatureHasActiveMandatesError extends Error {
    constructor() {
        super(
            'Não é possível remover legislatura com mandatos ativos vinculados.',
        );
        this.name = 'LegislatureHasActiveMandatesError';
    }
}

export class LegislatureInvalidDateRangeError extends Error {
    constructor() {
        super('Data fim não pode ser anterior à data início');
        this.name = 'LegislatureInvalidDateRangeError';
    }
}
