export class PortalNotFoundError extends Error {
    constructor() {
        super('Portal não encontrado');
        this.name = 'PortalNotFoundError';
    }
}

export class PortalInactiveError extends Error {
    constructor() {
        super('Portal institucional desativado');
        this.name = 'PortalInactiveError';
    }
}

export class PortalSlugAlreadyInUseError extends Error {
    constructor() {
        super('Este slug já está em uso por outra câmara');
        this.name = 'PortalSlugAlreadyInUseError';
    }
}

export class PortalSlugInvalidError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PortalSlugInvalidError';
    }
}
