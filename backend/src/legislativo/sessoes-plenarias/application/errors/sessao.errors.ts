export class SessaoPlenariaNotFoundError extends Error {
    constructor() {
        super('Sessão plenária não encontrada');
        this.name = 'SessaoPlenariaNotFoundError';
    }
}

export class SessaoTipoNotFoundError extends Error {
    constructor() {
        super('Tipo de sessão não encontrado nesta Câmara');
        this.name = 'SessaoTipoNotFoundError';
    }
}

export class SessaoInvalidDateRangeError extends Error {
    constructor() {
        super('Data fim não pode ser anterior à data início');
        this.name = 'SessaoInvalidDateRangeError';
    }
}

export class SessaoStatusChangeViaUpdateNotAllowedError extends Error {
    constructor() {
        super(
            'Situação da sessão só pode ser alterada via ciclo de vida (use cases dedicados)',
        );
        this.name = 'SessaoStatusChangeViaUpdateNotAllowedError';
    }
}

export class SessaoLifecycleActionNotAllowedError extends Error {
    constructor(action: string, status: string) {
        super(`Ação ${action} não permitida no status ${status}`);
        this.name = 'SessaoLifecycleActionNotAllowedError';
    }
}
