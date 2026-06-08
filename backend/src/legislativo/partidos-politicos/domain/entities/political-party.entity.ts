import { randomUUID } from 'crypto';

type PoliticalPartyProps = {
    id: string;
    tenantId: string;
    name: string;
    acronym: string;
    ideology: string | null;
    flagUrl: string | null;
    isRemoved: boolean;
    removedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export type PoliticalPartyPrimitives = PoliticalPartyProps;

export type CreatePoliticalPartyParams = {
    tenantId: string;
    name: string;
    acronym: string;
    ideology?: string | null;
    flagUrl?: string | null;
};

export type UpdatePoliticalPartyParams = {
    name?: string;
    acronym?: string;
    ideology?: string | null;
    flagUrl?: string | null;
};

export class PoliticalPartyEntity {
    private constructor(private props: PoliticalPartyProps) {}

    static create(params: CreatePoliticalPartyParams) {
        const now = new Date();
        const entity = new PoliticalPartyEntity({
            id: randomUUID(),
            tenantId: params.tenantId,
            name: params.name.trim(),
            acronym: params.acronym.trim().toUpperCase(),
            ideology: PoliticalPartyEntity.normalizeOptional(params.ideology),
            flagUrl: PoliticalPartyEntity.normalizeOptional(params.flagUrl),
            isRemoved: false,
            removedAt: null,
            createdAt: now,
            updatedAt: now,
        });
        entity.validate();
        return entity;
    }

    static restore(props: PoliticalPartyPrimitives) {
        return new PoliticalPartyEntity({
            ...props,
            createdAt: new Date(props.createdAt),
            updatedAt: new Date(props.updatedAt),
            removedAt: props.removedAt ? new Date(props.removedAt) : null,
        });
    }

    get id() {
        return this.props.id;
    }

    get tenantId() {
        return this.props.tenantId;
    }

    get name() {
        return this.props.name;
    }

    get acronym() {
        return this.props.acronym;
    }

    get ideology() {
        return this.props.ideology;
    }

    get flagUrl() {
        return this.props.flagUrl;
    }

    get isRemoved() {
        return this.props.isRemoved;
    }

    update(params: UpdatePoliticalPartyParams) {
        if (params.name !== undefined) {
            this.props.name = params.name.trim();
        }
        if (params.acronym !== undefined) {
            this.props.acronym = params.acronym.trim().toUpperCase();
        }
        if (params.ideology !== undefined) {
            this.props.ideology = PoliticalPartyEntity.normalizeOptional(
                params.ideology,
            );
        }
        if (params.flagUrl !== undefined) {
            this.props.flagUrl = PoliticalPartyEntity.normalizeOptional(
                params.flagUrl,
            );
        }
        this.props.updatedAt = new Date();
        this.validate();
    }

    markRemoved() {
        this.props.isRemoved = true;
        this.props.removedAt = new Date();
        this.props.updatedAt = new Date();
    }

    toPrimitives(): PoliticalPartyPrimitives {
        return { ...this.props };
    }

    private validate() {
        if (!this.props.tenantId?.trim()) {
            throw new Error('Tenant é obrigatório para partido político');
        }
        if (!this.props.name) {
            throw new Error('Nome do partido é obrigatório');
        }
        if (!this.props.acronym) {
            throw new Error('Sigla do partido é obrigatória');
        }
    }

    private static normalizeOptional(value?: string | null) {
        if (value === undefined || value === null) return null;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
}
