export class VotacaoNotFoundError extends Error {
    constructor() {
        super('Votação não encontrada para este item de pauta');
        this.name = 'VotacaoNotFoundError';
    }
}

export class VotacaoJaExisteError extends Error {
    constructor() {
        super('Já existe votação principal para este item de pauta');
        this.name = 'VotacaoJaExisteError';
    }
}

export class VotacaoJaFinalizadaError extends Error {
    constructor() {
        super('Votação já foi finalizada');
        this.name = 'VotacaoJaFinalizadaError';
    }
}

export class VotacaoPautaItemNotFoundError extends Error {
    constructor() {
        super('Item de pauta não encontrado');
        this.name = 'VotacaoPautaItemNotFoundError';
    }
}

export class VotacaoMateriaNotFoundError extends Error {
    constructor() {
        super('Matéria não encontrada');
        this.name = 'VotacaoMateriaNotFoundError';
    }
}

export class VotacaoSessaoNotFoundError extends Error {
    constructor() {
        super('Sessão plenária não encontrada');
        this.name = 'VotacaoSessaoNotFoundError';
    }
}

export class VotacaoSessaoInvalidaError extends Error {
    constructor() {
        super('Sessão não aceita votação neste momento');
        this.name = 'VotacaoSessaoInvalidaError';
    }
}

export class VotacaoMateriaNaoNaPautaError extends Error {
    constructor() {
        super('Matéria precisa estar na pauta para ser votada');
        this.name = 'VotacaoMateriaNaoNaPautaError';
    }
}

export class VotacaoQuorumNaoAtingidoError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'VotacaoQuorumNaoAtingidoError';
    }
}

export class VotacaoTipoSimbolicaError extends Error {
    constructor() {
        super(
            'Votação simbólica não registra voto por parlamentar; finalize com totais',
        );
        this.name = 'VotacaoTipoSimbolicaError';
    }
}

export class VotacaoTotaisSimbolicaObrigatoriosError extends Error {
    constructor() {
        super(
            'Votação simbólica exige votosSim e votosNao na finalização',
        );
        this.name = 'VotacaoTotaisSimbolicaObrigatoriosError';
    }
}

export class VotacaoParlamentarNotFoundError extends Error {
    constructor() {
        super('Parlamentar não encontrado');
        this.name = 'VotacaoParlamentarNotFoundError';
    }
}

export class VotacaoParlamentarAusenteError extends Error {
    constructor() {
        super('Somente parlamentares presentes podem registrar voto');
        this.name = 'VotacaoParlamentarAusenteError';
    }
}
