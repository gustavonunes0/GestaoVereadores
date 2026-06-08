export class AtoNotFoundError extends Error {
    constructor() {
        super('Ato não encontrado');
        this.name = 'AtoNotFoundError';
    }
}

export class TipoAtoNotFoundError extends Error {
    constructor() {
        super('Tipo de ato não encontrado');
        this.name = 'TipoAtoNotFoundError';
    }
}

export class ClassificacaoAtoNotFoundError extends Error {
    constructor() {
        super('Classificação de ato não encontrada');
        this.name = 'ClassificacaoAtoNotFoundError';
    }
}

export class AtoNumeroAlreadyInUseError extends Error {
    constructor() {
        super('Já existe ato com este número');
        this.name = 'AtoNumeroAlreadyInUseError';
    }
}

export class AtoDataFinalAnteriorInicialError extends Error {
    constructor() {
        super('Data final não pode ser anterior à data inicial');
        this.name = 'AtoDataFinalAnteriorInicialError';
    }
}

export class AtoDataPublicacaoFinalAnteriorInicialError extends Error {
    constructor() {
        super(
            'Data final de publicação não pode ser anterior à data inicial de publicação',
        );
        this.name = 'AtoDataPublicacaoFinalAnteriorInicialError';
    }
}
