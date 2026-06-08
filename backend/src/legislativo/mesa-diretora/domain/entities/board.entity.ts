import { randomUUID } from 'crypto';
import { BoardStatus } from '../enums/board-status.enum';

type BoardProps = {
    id: string;
    tenantId: string;
    legislatureId: string;
    name: string;
    startDate: Date;
    endDate: Date | null;
    status: BoardStatus;
    notes: string | null;
    isRemoved: boolean;
    removedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export type BoardPrimitives = BoardProps;

export type CreateBoardParams = {
    tenantId: string;
    legislatureId: string;
    name: string;
    startDate: Date;
    endDate?: Date | null;
    status?: BoardStatus;
    notes?: string | null;
};

export type UpdateBoardParams = {
    name?: string;
    startDate?: Date;
    endDate?: Date | null;
    status?: BoardStatus;
    notes?: string | null;
};

export class BoardEntity {
    private constructor(private props: BoardProps) {}

    static create(params: CreateBoardParams) {
        const now = new Date();
        const entity = new BoardEntity({
            id: randomUUID(),
            tenantId: params.tenantId,
            legislatureId: params.legislatureId,
            name: params.name.trim(),
            startDate: params.startDate,
            endDate: params.endDate ?? null,
            status: params.status ?? BoardStatus.ACTIVE,
            notes: BoardEntity.normalizeOptional(params.notes),
            isRemoved: false,
            removedAt: null,
            createdAt: now,
            updatedAt: now,
        });
        entity.validate();
        return entity;
    }

    static restore(props: BoardPrimitives) {
        return new BoardEntity({
            ...props,
            status: props.status as BoardStatus,
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

    get legislatureId() {
        return this.props.legislatureId;
    }

    update(params: UpdateBoardParams) {
        if (params.name !== undefined) {
            this.props.name = params.name.trim();
        }
        if (params.startDate !== undefined) {
            this.props.startDate = params.startDate;
        }
        if (params.endDate !== undefined) {
            this.props.endDate = params.endDate;
        }
        if (params.status !== undefined) {
            this.props.status = params.status;
        }
        if (params.notes !== undefined) {
            this.props.notes = BoardEntity.normalizeOptional(params.notes);
        }
        this.props.updatedAt = new Date();
        this.validate();
    }

    markRemoved() {
        this.props.isRemoved = true;
        this.props.removedAt = new Date();
        this.props.status = BoardStatus.FINISHED;
        this.props.updatedAt = new Date();
    }

    toPrimitives(): BoardPrimitives {
        return { ...this.props };
    }

    private validate() {
        if (!this.props.tenantId?.trim()) {
            throw new Error('Tenant é obrigatório para mesa diretora');
        }
        if (!this.props.legislatureId?.trim()) {
            throw new Error('Legislatura é obrigatória para mesa diretora');
        }
        if (!this.props.name) {
            throw new Error('Nome da mesa diretora é obrigatório');
        }
        if (
            this.props.endDate &&
            this.props.endDate.getTime() < this.props.startDate.getTime()
        ) {
            throw new Error('Data fim não pode ser anterior à data início');
        }
    }

    private static normalizeOptional(value?: string | null) {
        if (value === undefined || value === null) return null;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
}
