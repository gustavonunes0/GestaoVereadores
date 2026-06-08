export class PresencaNotFoundError extends Error {
    constructor() {
        super('Registro de presença não encontrado');
        this.name = 'PresencaNotFoundError';
    }
}

export class PresencaParlamentarNotFoundError extends Error {
    constructor() {
        super('Parlamentar não encontrado nesta Câmara');
        this.name = 'PresencaParlamentarNotFoundError';
    }
}

export class PresencaDuplicadaError extends Error {
    constructor() {
        super('Parlamentar já possui registro de presença nesta sessão');
        this.name = 'PresencaDuplicadaError';
    }
}

export class PresencaMandatoInativoError extends Error {
    constructor() {
        super('Parlamentar não possui mandato ativo na legislatura da sessão');
        this.name = 'PresencaMandatoInativoError';
    }
}

export class PresencaJustificativaObrigatoriaError extends Error {
    constructor() {
        super('Justificativa é obrigatória para presença JUSTIFICADA');
        this.name = 'PresencaJustificativaObrigatoriaError';
    }
}

export class PresencaSessaoEncerradaError extends Error {
    constructor() {
        super('Sessão encerrada ou cancelada não permite alteração de presença');
        this.name = 'PresencaSessaoEncerradaError';
    }
}
