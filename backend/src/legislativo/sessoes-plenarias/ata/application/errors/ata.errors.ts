export class AtaSessaoNaoEncerradaError extends Error {
    constructor() {
        super('Ata só pode ser gerada após a sessão ser encerrada');
    }
}

export class AtaJaExisteError extends Error {
    constructor() {
        super('Já existe uma ata para esta sessão');
    }
}

export class AtaNaoEncontradaError extends Error {
    constructor() {
        super('Ata não encontrada');
    }
}

export class AtaImutavelAposAprovacaoError extends Error {
    constructor() {
        super('Ata aprovada não pode ser editada');
    }
}
