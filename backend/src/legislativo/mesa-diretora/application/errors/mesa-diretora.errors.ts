export class MesaDiretoraNotFoundError extends Error {
    constructor() {
        super('Mesa diretora não encontrada');
        this.name = 'MesaDiretoraNotFoundError';
    }
}

export class LegislatureNotFoundForMesaDiretoraError extends Error {
    constructor() {
        super('Legislatura não encontrada');
        this.name = 'LegislatureNotFoundForMesaDiretoraError';
    }
}

export class MesaDiretoraInvalidDateRangeError extends Error {
    constructor() {
        super('Data fim não pode ser anterior à data início');
        this.name = 'MesaDiretoraInvalidDateRangeError';
    }
}

export class ParliamentarianNotFoundForMesaDiretoraError extends Error {
    constructor() {
        super('Parlamentar não encontrado');
        this.name = 'ParliamentarianNotFoundForMesaDiretoraError';
    }
}

export class BoardRoleNotFoundForMesaDiretoraError extends Error {
    constructor() {
        super('Cargo da mesa não encontrado');
        this.name = 'BoardRoleNotFoundForMesaDiretoraError';
    }
}

export class BoardRoleAlreadyOccupiedError extends Error {
    constructor() {
        super('Este cargo já está ocupado nesta mesa diretora');
        this.name = 'BoardRoleAlreadyOccupiedError';
    }
}

export class ParliamentarianAlreadyOnBoardError extends Error {
    constructor() {
        super('Parlamentar já integra esta mesa diretora');
        this.name = 'ParliamentarianAlreadyOnBoardError';
    }
}

export class MesaDiretoraMembroNotFoundError extends Error {
    constructor() {
        super('Membro não encontrado nesta mesa diretora');
        this.name = 'MesaDiretoraMembroNotFoundError';
    }
}

export class BoardRoleNameAlreadyInUseError extends Error {
    constructor() {
        super('Já existe cargo da mesa com este nome');
        this.name = 'BoardRoleNameAlreadyInUseError';
    }
}
