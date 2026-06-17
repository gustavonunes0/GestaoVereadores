export class ParliamentarianAccessAlreadyGrantedError extends Error {
    constructor() {
        super('Parlamentar já possui acesso ao sistema');
        this.name = 'ParliamentarianAccessAlreadyGrantedError';
    }
}

export class ParliamentarianAccessNotFoundError extends Error {
    constructor() {
        super('Parlamentar não possui acesso ativo');
        this.name = 'ParliamentarianAccessNotFoundError';
    }
}
