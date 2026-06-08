export class NormaNotFoundError extends Error {
    constructor() {
        super('Norma não encontrada');
        this.name = 'NormaNotFoundError';
    }
}

export class TipoNormaNotFoundError extends Error {
    constructor() {
        super('Tipo de norma não encontrado');
        this.name = 'TipoNormaNotFoundError';
    }
}

export class AnoNotFoundError extends Error {
    constructor() {
        super('Ano não encontrado');
        this.name = 'AnoNotFoundError';
    }
}

export class EsferaFederacaoNotFoundError extends Error {
    constructor() {
        super('Esfera de federação não encontrada');
        this.name = 'EsferaFederacaoNotFoundError';
    }
}

export class IdentificadorNormaNotFoundError extends Error {
    constructor() {
        super('Identificador de norma não encontrado');
        this.name = 'IdentificadorNormaNotFoundError';
    }
}

export class MateriaOrigemNotFoundError extends Error {
    constructor() {
        super('Matéria de origem não encontrada');
        this.name = 'MateriaOrigemNotFoundError';
    }
}

export class MateriaNaoPodeGerarNormaError extends Error {
    constructor() {
        super('A matéria informada não pode gerar norma');
        this.name = 'MateriaNaoPodeGerarNormaError';
    }
}
