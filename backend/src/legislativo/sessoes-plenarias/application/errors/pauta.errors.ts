export class PautaItemNotFoundError extends Error {
    constructor() {
        super('Item de pauta não encontrado');
        this.name = 'PautaItemNotFoundError';
    }
}

export class PautaMateriaDuplicadaError extends Error {
    constructor() {
        super('Matéria já consta na pauta desta sessão');
        this.name = 'PautaMateriaDuplicadaError';
    }
}

export class PautaOrdemEmUsoError extends Error {
    constructor(ordem: number) {
        super(`Ordem ${ordem} já está em uso na pauta desta sessão`);
        this.name = 'PautaOrdemEmUsoError';
    }
}

export class PautaMateriaNaoNaPautaError extends Error {
    constructor() {
        super('Matéria precisa estar na pauta da sessão antes de ser votada');
        this.name = 'PautaMateriaNaoNaPautaError';
    }
}

export class PautaSessaoNaoAceitaAlteracaoError extends Error {
    constructor() {
        super(
            'Pauta só pode ser alterada quando a sessão está EM_ANDAMENTO',
        );
        this.name = 'PautaSessaoNaoAceitaAlteracaoError';
    }
}

export class PautaMateriaNotFoundError extends Error {
    constructor() {
        super('Matéria não encontrada');
        this.name = 'PautaMateriaNotFoundError';
    }
}

export class PautaItemComVotacaoAbertaError extends Error {
    constructor() {
        super(
            'Não é possível remover item de pauta com votação em andamento',
        );
        this.name = 'PautaItemComVotacaoAbertaError';
    }
}
