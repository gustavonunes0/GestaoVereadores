export class VotoNotFoundError extends Error {
    constructor() {
        super('Voto parlamentar não encontrado');
        this.name = 'VotoNotFoundError';
    }
}

export class VotoDuplicadoError extends Error {
    constructor() {
        super('Parlamentar já registrou voto nesta votação');
        this.name = 'VotoDuplicadoError';
    }
}

export class VotoMandatoInativoError extends Error {
    constructor() {
        super('Parlamentar não possui mandato ativo na legislatura da sessão');
        this.name = 'VotoMandatoInativoError';
    }
}

export class VotoParlamentarNotFoundError extends Error {
    constructor() {
        super('Parlamentar não encontrado');
        this.name = 'VotoParlamentarNotFoundError';
    }
}

export class VotoParlamentarAusenteError extends Error {
    constructor() {
        super('Somente parlamentares presentes podem registrar voto');
        this.name = 'VotoParlamentarAusenteError';
    }
}

export class VotoVotacaoEncerradaError extends Error {
    constructor() {
        super('Votação já foi finalizada');
        this.name = 'VotoVotacaoEncerradaError';
    }
}

export class VotoTipoSimbolicaError extends Error {
    constructor() {
        super(
            'Votação simbólica não registra voto por parlamentar; finalize com totais',
        );
        this.name = 'VotoTipoSimbolicaError';
    }
}
