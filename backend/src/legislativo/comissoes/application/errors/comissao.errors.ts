export class ComissaoNotFoundError extends Error {
    constructor() {
        super('Comissão não encontrada');
        this.name = 'ComissaoNotFoundError';
    }
}

export class ComissaoInvalidDateRangeError extends Error {
    constructor() {
        super('Data fim não pode ser anterior à data início');
        this.name = 'ComissaoInvalidDateRangeError';
    }
}

export class ComissaoAcronymAlreadyInUseError extends Error {
    constructor() {
        super('Já existe comissão com esta sigla no tenant');
        this.name = 'ComissaoAcronymAlreadyInUseError';
    }
}

export class ComissaoPurposeRequiredError extends Error {
    constructor() {
        super('Finalidade da comissão é obrigatória');
        this.name = 'ComissaoPurposeRequiredError';
    }
}

export class ParliamentarianNotFoundForComissaoError extends Error {
    constructor() {
        super('Parlamentar não encontrado');
        this.name = 'ParliamentarianNotFoundForComissaoError';
    }
}

export class ParliamentarianAlreadyOnCommitteeError extends Error {
    constructor() {
        super('Parlamentar já integra esta comissão');
        this.name = 'ParliamentarianAlreadyOnCommitteeError';
    }
}

export class CommitteeExclusiveRoleAlreadyAssignedError extends Error {
    constructor() {
        super('Esta função já está ocupada nesta comissão');
        this.name = 'CommitteeExclusiveRoleAlreadyAssignedError';
    }
}

export class ComissaoMembroNotFoundError extends Error {
    constructor() {
        super('Membro não encontrado nesta comissão');
        this.name = 'ComissaoMembroNotFoundError';
    }
}
