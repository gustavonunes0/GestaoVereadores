import { randomUUID } from 'crypto';
import { ParliamentaryFrontStatus } from '../enums/parliamentary-front-status.enum';

type ParliamentaryFrontProps = {
    id: string;
    tenantId: string;
    name: string;
    theme: string;
    description: string | null;
    startDate: Date | null;
    endDate: Date | null;
    status: ParliamentaryFrontStatus;
    coordinatorParliamentarianId: string | null;
    createdByTenantUserId: string | null;
    isRemoved: boolean;
    removedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export type ParliamentaryFrontPrimitives = ParliamentaryFrontProps;

export type CreateParliamentaryFrontParams = {
    tenantId: string;
    name: string;
    theme: string;
    description?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    status?: ParliamentaryFrontStatus;
    coordinatorParliamentarianId?: string | null;
    createdByTenantUserId?: string | null;
};

export type UpdateParliamentaryFrontParams = {
    name?: string;
    theme?: string;
    description?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    status?: ParliamentaryFrontStatus;
    coordinatorParliamentarianId?: string | null;
};

export class ParliamentaryFrontEntity {
    private constructor(private props: ParliamentaryFrontProps) {}

    static create(params: CreateParliamentaryFrontParams) {
        const now = new Date();
        const entity = new ParliamentaryFrontEntity({
            id: randomUUID(),
            tenantId: params.tenantId,
            name: params.name.trim(),
            theme: params.theme.trim(),
            description: ParliamentaryFrontEntity.normalizeOptional(
                params.description,
            ),
            startDate: params.startDate ?? null,
            endDate: params.endDate ?? null,
            status: params.status ?? ParliamentaryFrontStatus.ACTIVE,
            coordinatorParliamentarianId:
                params.coordinatorParliamentarianId ?? null,
            createdByTenantUserId: params.createdByTenantUserId ?? null,
            isRemoved: false,
            removedAt: null,
            createdAt: now,
            updatedAt: now,
        });
        entity.validate();
        return entity;
    }

    static restore(props: ParliamentaryFrontPrimitives) {
        return new ParliamentaryFrontEntity({
            ...props,
            status: props.status as ParliamentaryFrontStatus,
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

    update(params: UpdateParliamentaryFrontParams) {
        if (params.name !== undefined) {
            this.props.name = params.name.trim();
        }
        if (params.theme !== undefined) {
            this.props.theme = params.theme.trim();
        }
        if (params.description !== undefined) {
            this.props.description = ParliamentaryFrontEntity.normalizeOptional(
                params.description,
            );
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
        if (params.coordinatorParliamentarianId !== undefined) {
            this.props.coordinatorParliamentarianId =
                params.coordinatorParliamentarianId;
        }
        this.props.updatedAt = new Date();
        this.validate();
    }

    markRemoved() {
        this.props.isRemoved = true;
        this.props.removedAt = new Date();
        this.props.status = ParliamentaryFrontStatus.FINISHED;
        this.props.updatedAt = new Date();
    }

    toPrimitives(): ParliamentaryFrontPrimitives {
        return { ...this.props };
    }

    private validate() {
        if (!this.props.tenantId?.trim()) {
            throw new Error('Tenant é obrigatório para frente parlamentar');
        }
        if (!this.props.name) {
            throw new Error('Nome da frente é obrigatório');
        }
        if (!this.props.theme) {
            throw new Error('Tema da frente é obrigatório');
        }
        if (
            this.props.startDate &&
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
