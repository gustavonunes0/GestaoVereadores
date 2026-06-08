export class ParliamentarianNotFoundForMandateError extends Error {
    constructor() {
        super('Parlamentar não encontrado');
        this.name = 'ParliamentarianNotFoundForMandateError';
    }
}

export class LegislatureNotFoundForMandateError extends Error {
    constructor() {
        super('Legislatura não encontrada');
        this.name = 'LegislatureNotFoundForMandateError';
    }
}

export class ParlamentarMandatoNotFoundError extends Error {
    constructor() {
        super('Mandato não encontrado');
        this.name = 'ParlamentarMandatoNotFoundError';
    }
}

export class ActiveParlamentarMandatoAlreadyExistsError extends Error {
    constructor() {
        super('Parlamentar já possui mandato ativo nesta legislatura');
        this.name = 'ActiveParlamentarMandatoAlreadyExistsError';
    }
}

export class ParlamentarMandatoAlreadyFinishedError extends Error {
    constructor() {
        super('Mandato já está encerrado ou interrompido');
        this.name = 'ParlamentarMandatoAlreadyFinishedError';
    }
}

export class ParlamentarMandatoInvalidDateRangeError extends Error {
    constructor() {
        super('Data fim do mandato não pode ser anterior à data início');
        this.name = 'ParlamentarMandatoInvalidDateRangeError';
    }
}

export class ParlamentarMandatoInvalidFinishStatusError extends Error {
    constructor() {
        super(
            'Status de encerramento inválido; use FINISHED, INTERRUPTED ou LICENSED',
        );
        this.name = 'ParlamentarMandatoInvalidFinishStatusError';
    }
}
