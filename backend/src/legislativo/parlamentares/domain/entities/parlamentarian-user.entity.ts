import { randomUUID } from 'crypto';
import { ParlamentarianUserStatus } from '../enums/parlamentarian-user-status.enum';

type ParlamentarianUserProps = {
    id: string;
    tenantId: string;
    parliamentarianId: string;
    userId: string;
    politicalPartyId: string | null;
    status: ParlamentarianUserStatus;
    lastAccessAt: Date | null;
    isRemoved: boolean;
    removedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export type ParlamentarianUserPrimitives = ParlamentarianUserProps;

export type CreateParlamentarianUserParams = {
    tenantId: string;
    parliamentarianId: string;
    userId: string;
    politicalPartyId?: string | null;
};

export class ParlamentarianUserEntity {
    private constructor(private props: ParlamentarianUserProps) {}

    static create(params: CreateParlamentarianUserParams) {
        const now = new Date();
        return new ParlamentarianUserEntity({
            id: randomUUID(),
            tenantId: params.tenantId,
            parliamentarianId: params.parliamentarianId,
            userId: params.userId,
            politicalPartyId: params.politicalPartyId ?? null,
            status: ParlamentarianUserStatus.ACTIVE,
            lastAccessAt: null,
            isRemoved: false,
            removedAt: null,
            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: ParlamentarianUserProps) {
        return new ParlamentarianUserEntity(props);
    }

    deactivate() {
        this.props.status = ParlamentarianUserStatus.INACTIVE;
        this.props.updatedAt = new Date();
    }

    updatePoliticalParty(politicalPartyId: string | null) {
        this.props.politicalPartyId = politicalPartyId;
        this.props.updatedAt = new Date();
    }

    toPrimitives(): ParlamentarianUserPrimitives {
        return { ...this.props };
    }

    get id() {
        return this.props.id;
    }

    get userId() {
        return this.props.userId;
    }

    get parliamentarianId() {
        return this.props.parliamentarianId;
    }
}
