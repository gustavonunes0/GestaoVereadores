export class InvalidCredentialsError extends Error {
    constructor() {
        super('Credenciais inválidas');
        this.name = 'InvalidCredentialsError';
    }
}

export class SiglUserNotFoundError extends Error {
    constructor() {
        super('Usuário não encontrado');
        this.name = 'SiglUserNotFoundError';
    }
}

export class SiglUsernameAlreadyInUseError extends Error {
    constructor() {
        super('Nome de usuário já existe');
        this.name = 'SiglUsernameAlreadyInUseError';
    }
}

export class InvalidCurrentPasswordError extends Error {
    constructor() {
        super('Senha atual incorreta');
        this.name = 'InvalidCurrentPasswordError';
    }
}

export class InvalidTenantError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidTenantError';
    }
}

export class TenantMembershipRequiredError extends Error {
    constructor() {
        super('Usuário sem vínculo ativo nesta câmara');
        this.name = 'TenantMembershipRequiredError';
    }
}

export class TenantResolutionRequiredError extends Error {
    constructor() {
        super('Informe tenantId ou tenantCnpj');
        this.name = 'TenantResolutionRequiredError';
    }
}
