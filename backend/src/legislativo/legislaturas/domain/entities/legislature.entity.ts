import { randomUUID } from 'crypto';

type LegislatureProps = {
    id: string;
    tenantId: string;
    number: number;
    startDate: Date;
    endDate: Date | null;
    isCurrent: boolean;
    isRemoved: boolean;
    removedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export type LegislaturePrimitives = LegislatureProps;

export type CreateLegislatureParams = {
    tenantId: string;
    number: number;
    startDate: Date;
    endDate?: Date | null;
    isCurrent?: boolean;
};

export type UpdateLegislatureParams = {
    number?: number;
    startDate?: Date;
    endDate?: Date | null;
    isCurrent?: boolean;
};

export class LegislatureEntity {
    private constructor(private props: LegislatureProps) {}

    static create(params: CreateLegislatureParams) {
        const now = new Date();
        const entity = new LegislatureEntity({
            id: randomUUID(),
            tenantId: params.tenantId,
            number: params.number,
            startDate: params.startDate,
            endDate: params.endDate ?? null,
            isCurrent: params.isCurrent ?? false,
            isRemoved: false,
            removedAt: null,
            createdAt: now,
            updatedAt: now,
        });
        entity.validate();
        return entity;
    }

    static restore(props: LegislaturePrimitives) {
        return new LegislatureEntity({
            ...props,
            startDate: new Date(props.startDate),
            endDate: props.endDate ? new Date(props.endDate) : null,
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

    get number() {
        return this.props.number;
    }

    get isCurrent() {
        return this.props.isCurrent;
    }

    update(params: UpdateLegislatureParams) {
        if (params.number !== undefined) this.props.number = params.number;
        if (params.startDate !== undefined) {
            this.props.startDate = params.startDate;
        }
        if (params.endDate !== undefined) this.props.endDate = params.endDate;
        if (params.isCurrent !== undefined) {
            this.props.isCurrent = params.isCurrent;
        }
        this.props.updatedAt = new Date();
        this.validate();
    }

    markRemoved() {
        this.props.isRemoved = true;
        this.props.removedAt = new Date();
        this.props.isCurrent = false;
        this.props.updatedAt = new Date();
    }

    toPrimitives(): LegislaturePrimitives {
        return { ...this.props };
    }

    private validate() {
        if (!this.props.tenantId?.trim()) {
            throw new Error('Tenant é obrigatório para legislatura');
        }
        if (this.props.number < 1) {
            throw new Error('Número da legislatura deve ser positivo');
        }
        if (
            this.props.endDate &&
            this.props.endDate.getTime() < this.props.startDate.getTime()
        ) {
            throw new Error('Data fim não pode ser anterior à data início');
        }
    }
}
