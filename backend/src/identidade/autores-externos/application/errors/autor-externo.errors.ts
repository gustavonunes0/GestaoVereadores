export class AutorExternoNotFoundError extends Error {
    constructor() {
        super('Autor externo não encontrado');
        this.name = 'AutorExternoNotFoundError';
    }
}

export class TipoAutorInvalidoError extends Error {
    constructor() {
        super('Tipo de autor inválido');
        this.name = 'TipoAutorInvalidoError';
    }
}
