export class MatterNotFoundError extends Error {
    constructor() {
        super('Matéria não encontrada');
        this.name = 'MatterNotFoundError';
    }
}

export class MatterEmentaRequiredError extends Error {
    constructor() {
        super('Ementa da matéria é obrigatória');
        this.name = 'MatterEmentaRequiredError';
    }
}

export class MatterInvalidStatusTransitionError extends Error {
    constructor(from: string, to: string) {
        super(`Transição de status inválida: ${from} → ${to}`);
        this.name = 'MatterInvalidStatusTransitionError';
    }
}

export class MatterCannotEnterAgendaError extends Error {
    constructor() {
        super(
            'Somente matérias com status EM_TRAMITACAO podem entrar na pauta',
        );
        this.name = 'MatterCannotEnterAgendaError';
    }
}

export class MatterCannotGenerateNormError extends Error {
    constructor() {
        super('Norma jurídica só pode ser criada a partir de matéria APROVADA');
        this.name = 'MatterCannotGenerateNormError';
    }
}

export class ParliamentarianNotFoundForMatterError extends Error {
    constructor() {
        super('Parlamentar não encontrado nesta Câmara');
        this.name = 'ParliamentarianNotFoundForMatterError';
    }
}

export class TenantPartnerNotFoundForMatterError extends Error {
    constructor() {
        super('Parceiro externo não encontrado nesta Câmara');
        this.name = 'TenantPartnerNotFoundForMatterError';
    }
}

export class MatterCoauthorAlreadyExistsError extends Error {
    constructor() {
        super('Parlamentar já é coautor desta matéria');
        this.name = 'MatterCoauthorAlreadyExistsError';
    }
}

export class MatterCoauthorNotFoundError extends Error {
    constructor() {
        super('Coautor não encontrado nesta matéria');
        this.name = 'MatterCoauthorNotFoundError';
    }
}

export class MatterAuthorshipValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MatterAuthorshipValidationError';
    }
}

export class MatterStatusChangeViaUpdateNotAllowedError extends Error {
    constructor() {
        super(
            'Status da matéria só pode ser alterado via tramitação (use cases dedicados)',
        );
        this.name = 'MatterStatusChangeViaUpdateNotAllowedError';
    }
}

export class MatterTramitationActionNotAllowedError extends Error {
    constructor(action: string, status: string) {
        super(`Ação ${action} não permitida no status ${status}`);
        this.name = 'MatterTramitationActionNotAllowedError';
    }
}

export class TipoAutorNotFoundForMatterError extends Error {
    constructor() {
        super('Tipo de autor não configurado para esta Câmara');
        this.name = 'TipoAutorNotFoundForMatterError';
    }
}
