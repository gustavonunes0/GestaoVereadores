export class FrenteNotFoundError extends Error {
    constructor() {
        super('Frente parlamentar não encontrada');
        this.name = 'FrenteNotFoundError';
    }
}

export class FrenteInvalidDateRangeError extends Error {
    constructor() {
        super('Data fim não pode ser anterior à data início');
        this.name = 'FrenteInvalidDateRangeError';
    }
}

export class FrenteThemeRequiredError extends Error {
    constructor() {
        super('Tema da frente é obrigatório');
        this.name = 'FrenteThemeRequiredError';
    }
}

export class ParliamentarianNotFoundForFrenteError extends Error {
    constructor() {
        super('Parlamentar não encontrado');
        this.name = 'ParliamentarianNotFoundForFrenteError';
    }
}

export class ParliamentarianAlreadyOnFrontError extends Error {
    constructor() {
        super('Parlamentar já integra esta frente parlamentar');
        this.name = 'ParliamentarianAlreadyOnFrontError';
    }
}

export class TenantUserNotFoundForFrenteError extends Error {
    constructor() {
        super('Usuário da câmara não encontrado');
        this.name = 'TenantUserNotFoundForFrenteError';
    }
}

export class FrenteMembroNotFoundError extends Error {
    constructor() {
        super('Membro não encontrado nesta frente parlamentar');
        this.name = 'FrenteMembroNotFoundError';
    }
}
