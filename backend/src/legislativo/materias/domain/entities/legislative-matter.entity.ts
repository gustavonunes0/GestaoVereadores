import { randomUUID } from 'crypto';
import { MatterStatus } from '../enums/matter-status.enum';

type LegislativeMatterProps = {
    id: string;
    tenantId: string;
    tipoId: string;
    ementa: string;
    numero: number | null;
    anoId: string | null;
    status: MatterStatus;
    autorId: string | null;
    relatorId: string | null;
    isRemoved: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type LegislativeMatterPrimitives = LegislativeMatterProps;

export type CreateLegislativeMatterParams = {
    tenantId: string;
    tipoId: string;
    ementa: string;
    numero?: number | null;
    anoId?: string | null;
    status?: MatterStatus;
    autorId?: string | null;
    relatorId?: string | null;
};

/**
 * Proposição legislativa da Câmara — não é apenas registro CRUD;
 * possui ciclo de vida com status e tramitação.
 */
export class LegislativeMatterEntity {
    private constructor(private props: LegislativeMatterProps) {}

    static create(params: CreateLegislativeMatterParams) {
        const now = new Date();
        const entity = new LegislativeMatterEntity({
            id: randomUUID(),
            tenantId: params.tenantId,
            tipoId: params.tipoId,
            ementa: params.ementa.trim(),
            numero: params.numero ?? null,
            anoId: params.anoId ?? null,
            status: params.status ?? MatterStatus.DRAFT,
            autorId: params.autorId ?? null,
            relatorId: params.relatorId ?? null,
            isRemoved: false,
            createdAt: now,
            updatedAt: now,
        });
        entity.validate();
        return entity;
    }

    static restore(props: LegislativeMatterPrimitives) {
        return new LegislativeMatterEntity({
            ...props,
            status: props.status as MatterStatus,
            createdAt: new Date(props.createdAt),
            updatedAt: new Date(props.updatedAt),
        });
    }

    private validate() {
        if (!this.props.tenantId?.trim()) {
            throw new Error('Matéria deve pertencer a uma Câmara (tenant)');
        }
        if (!this.props.tipoId?.trim()) {
            throw new Error('Tipo da matéria é obrigatório');
        }
        if (!this.props.ementa?.trim() || this.props.ementa.trim().length < 3) {
            throw new Error('Ementa da matéria é obrigatória');
        }
    }

    toPrimitives(): LegislativeMatterPrimitives {
        return { ...this.props };
    }

    get status() {
        return this.props.status;
    }
}
