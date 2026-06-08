import { randomUUID } from 'crypto';
import { ParliamentarianStatus } from '../enums/parliamentarian-status.enum';

type ParliamentarianProps = {
    id: string;
    tenantId: string;
    tenantUserId: string;
    politicalPartyId: string | null;
    parliamentaryName: string;
    officeNumber: string | null;
    photoUrl: string | null;
    biography: string | null;
    status: ParliamentarianStatus;
    isRemoved: boolean;
    removedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export type ParliamentarianPrimitives = ParliamentarianProps;

export type CreateParliamentarianParams = {
    tenantId: string;
    tenantUserId: string;
    politicalPartyId?: string | null;
    parliamentaryName: string;
    officeNumber?: string | null;
    photoUrl?: string | null;
    biography?: string | null;
};

export type UpdateParliamentarianParams = {
    politicalPartyId?: string | null;
    parliamentaryName?: string;
    officeNumber?: string | null;
    photoUrl?: string | null;
    biography?: string | null;
    status?: ParliamentarianStatus;
};

export class ParliamentarianEntity {
    private constructor(private props: ParliamentarianProps) {}

    static create(params: CreateParliamentarianParams) {
        const now = new Date();
        const entity = new ParliamentarianEntity({
            id: randomUUID(),
            tenantId: params.tenantId,
            tenantUserId: params.tenantUserId,
            politicalPartyId: params.politicalPartyId ?? null,
            parliamentaryName: params.parliamentaryName.trim(),
            officeNumber: ParliamentarianEntity.normalizeOptional(
                params.officeNumber,
            ),
            photoUrl: ParliamentarianEntity.normalizeOptional(params.photoUrl),
            biography: ParliamentarianEntity.normalizeOptional(
                params.biography,
            ),
            status: ParliamentarianStatus.ACTIVE,
            isRemoved: false,
            removedAt: null,
            createdAt: now,
            updatedAt: now,
        });
        entity.validate();
        return entity;
    }

    static restore(props: ParliamentarianPrimitives) {
        return new ParliamentarianEntity({
            ...props,
            status: props.status as ParliamentarianStatus,
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

    get tenantUserId() {
        return this.props.tenantUserId;
    }

    get politicalPartyId() {
        return this.props.politicalPartyId;
    }

    update(params: UpdateParliamentarianParams) {
        if (params.politicalPartyId !== undefined) {
            this.props.politicalPartyId = params.politicalPartyId;
        }
        if (params.parliamentaryName !== undefined) {
            this.props.parliamentaryName = params.parliamentaryName.trim();
        }
        if (params.officeNumber !== undefined) {
            this.props.officeNumber = ParliamentarianEntity.normalizeOptional(
                params.officeNumber,
            );
        }
        if (params.photoUrl !== undefined) {
            this.props.photoUrl = ParliamentarianEntity.normalizeOptional(
                params.photoUrl,
            );
        }
        if (params.biography !== undefined) {
            this.props.biography = ParliamentarianEntity.normalizeOptional(
                params.biography,
            );
        }
        if (params.status !== undefined) {
            this.props.status = params.status;
        }
        this.props.updatedAt = new Date();
        this.validate();
    }

    markRemoved() {
        this.props.isRemoved = true;
        this.props.removedAt = new Date();
        this.props.status = ParliamentarianStatus.REMOVED;
        this.props.updatedAt = new Date();
    }

    toPrimitives(): ParliamentarianPrimitives {
        return { ...this.props };
    }

    private validate() {
        if (!this.props.tenantUserId?.trim()) {
            throw new Error('Vínculo TenantUser é obrigatório para parlamentar');
        }
        if (!this.props.parliamentaryName) {
            throw new Error('Nome parlamentar é obrigatório');
        }
    }

    private static normalizeOptional(value?: string | null) {
        if (value === undefined || value === null) return null;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
}
