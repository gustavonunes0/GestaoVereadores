import { randomUUID } from 'crypto';
import { CommitteeStatus } from '../enums/committee-status.enum';
import { CommitteeType } from '../enums/committee-type.enum';

type CommitteeProps = {
    id: string;
    tenantId: string;
    name: string;
    acronym: string | null;
    type: CommitteeType;
    purpose: string;
    startDate: Date | null;
    endDate: Date | null;
    status: CommitteeStatus;
    notes: string | null;
    isRemoved: boolean;
    removedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export type CommitteePrimitives = CommitteeProps;

export type CreateCommitteeParams = {
    tenantId: string;
    name: string;
    acronym?: string | null;
    type: CommitteeType;
    purpose: string;
    startDate?: Date | null;
    endDate?: Date | null;
    status?: CommitteeStatus;
    notes?: string | null;
};

export type UpdateCommitteeParams = {
    name?: string;
    acronym?: string | null;
    type?: CommitteeType;
    purpose?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    status?: CommitteeStatus;
    notes?: string | null;
};

export class CommitteeEntity {
    private constructor(private props: CommitteeProps) {}

    static create(params: CreateCommitteeParams) {
        const now = new Date();
        const entity = new CommitteeEntity({
            id: randomUUID(),
            tenantId: params.tenantId,
            name: params.name.trim(),
            acronym: CommitteeEntity.normalizeAcronym(params.acronym),
            type: params.type,
            purpose: params.purpose.trim(),
            startDate: params.startDate ?? null,
            endDate: params.endDate ?? null,
            status: params.status ?? CommitteeStatus.ACTIVE,
            notes: CommitteeEntity.normalizeOptional(params.notes),
            isRemoved: false,
            removedAt: null,
            createdAt: now,
            updatedAt: now,
        });
        entity.validate();
        return entity;
    }

    static restore(props: CommitteePrimitives) {
        return new CommitteeEntity({
            ...props,
            type: props.type as CommitteeType,
            status: props.status as CommitteeStatus,
            startDate: props.startDate ? new Date(props.startDate) : null,
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

    get acronym() {
        return this.props.acronym;
    }

    update(params: UpdateCommitteeParams) {
        if (params.name !== undefined) {
            this.props.name = params.name.trim();
        }
        if (params.acronym !== undefined) {
            this.props.acronym = CommitteeEntity.normalizeAcronym(
                params.acronym,
            );
        }
        if (params.type !== undefined) {
            this.props.type = params.type;
        }
        if (params.purpose !== undefined) {
            this.props.purpose = params.purpose.trim();
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
            this.props.notes = CommitteeEntity.normalizeOptional(params.notes);
        }
        this.props.updatedAt = new Date();
        this.validate();
    }

    markRemoved() {
        this.props.isRemoved = true;
        this.props.removedAt = new Date();
        this.props.status = CommitteeStatus.FINISHED;
        this.props.updatedAt = new Date();
    }

    toPrimitives(): CommitteePrimitives {
        return { ...this.props };
    }

    private validate() {
        if (!this.props.tenantId?.trim()) {
            throw new Error('Tenant é obrigatório para comissão');
        }
        if (!this.props.name) {
            throw new Error('Nome da comissão é obrigatório');
        }
        if (!this.props.purpose) {
            throw new Error('Finalidade da comissão é obrigatória');
        }
        if (
            this.props.startDate &&
            this.props.endDate &&
            this.props.endDate.getTime() < this.props.startDate.getTime()
        ) {
            throw new Error('Data fim não pode ser anterior à data início');
        }
    }

    private static normalizeAcronym(value?: string | null) {
        if (value === undefined || value === null) return null;
        const trimmed = value.trim().toUpperCase();
        return trimmed.length > 0 ? trimmed : null;
    }

    private static normalizeOptional(value?: string | null) {
        if (value === undefined || value === null) return null;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
}
