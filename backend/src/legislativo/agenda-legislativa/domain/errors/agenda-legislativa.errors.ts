export class AgendaNotFoundError extends Error {
    constructor() {
        super('Agenda não encontrada');
        this.name = 'AgendaNotFoundError';
    }
}

export class AgendaInvalidDateRangeError extends Error {
    constructor() {
        super('Data final não pode ser anterior à data inicial');
        this.name = 'AgendaInvalidDateRangeError';
    }
}
