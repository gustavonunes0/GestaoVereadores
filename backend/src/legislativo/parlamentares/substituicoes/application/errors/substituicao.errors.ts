export class SubstituicaoNotFoundError extends Error {
    constructor() {
        super('Substituição não encontrada');
        this.name = 'SubstituicaoNotFoundError';
    }
}

export class TitularInvalidoError extends Error {
    constructor() {
        super('O parlamentar informado como titular não possui mandato ativo de titular');
        this.name = 'TitularInvalidoError';
    }
}

export class SuplenteInvalidoError extends Error {
    constructor() {
        super(
            'O parlamentar informado como suplente não possui mandato ativo de suplente na legislatura do titular',
        );
        this.name = 'SuplenteInvalidoError';
    }
}

export class SubstituicaoPeriodoInvalidoError extends Error {
    constructor() {
        super('Data fim da substituição não pode ser anterior à data início');
        this.name = 'SubstituicaoPeriodoInvalidoError';
    }
}

export class TitularJaSubstituidoNoPeriodoError extends Error {
    constructor() {
        super('O titular já possui um suplente em exercício no período informado');
        this.name = 'TitularJaSubstituidoNoPeriodoError';
    }
}

export class SuplenteJaEmExercicioNoPeriodoError extends Error {
    constructor() {
        super('O suplente já substitui outro titular no período informado');
        this.name = 'SuplenteJaEmExercicioNoPeriodoError';
    }
}

export class SubstituicaoNaoEditavelError extends Error {
    constructor() {
        super('Apenas substituições ativas podem ser alteradas ou encerradas');
        this.name = 'SubstituicaoNaoEditavelError';
    }
}
