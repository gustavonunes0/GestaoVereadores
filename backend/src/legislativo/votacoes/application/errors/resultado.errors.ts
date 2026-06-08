export class ResultadoManualNaoPermitidoError extends Error {
    constructor() {
        super(
            'Votação nominal ou secreta calcula totais automaticamente; não informe votosSim, votosNao ou abstencoes manualmente',
        );
        this.name = 'ResultadoManualNaoPermitidoError';
    }
}

export class ResultadoVotacaoJaCalculadoError extends Error {
    constructor() {
        super('Votação já foi finalizada e possui resultado calculado');
        this.name = 'ResultadoVotacaoJaCalculadoError';
    }
}
