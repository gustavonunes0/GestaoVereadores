import { randomUUID } from 'crypto';
import { MandateStatus } from '../enums/mandate-status.enum';

type ParliamentarianMandateProps = {
    id: string;
    tenantId: string;
    parliamentarianId: string;
    legislatureId: string;
    partyAcronym: string | null;
    partyName: string | null;
    startedAt: Date;
    endedAt: Date | null;
    status: MandateStatus;
    isRemoved: boolean;
    removedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export type ParliamentarianMandatePrimitives = ParliamentarianMandateProps;

export type CreateParliamentarianMandateParams = {
    tenantId: string;
    parliamentarianId: string;
    legislatureId: string;
    partyAcronym?: string | null;
    partyName?: string | null;
    startedAt: Date;
};

export type FinishParliamentarianMandateParams = {
    status: MandateStatus;
    endedAt: Date;
};

export class ParliamentarianMandateEntity {
    private constructor(private props: ParliamentarianMandateProps) {}

    static create(params: CreateParliamentarianMandateParams) {
        const now = new Date();
        const entity = new ParliamentarianMandateEntity({
            id: randomUUID(),
            tenantId: params.tenantId,
            parliamentarianId: params.parliamentarianId,
            legislatureId: params.legislatureId,
            partyAcronym: ParliamentarianMandateEntity.normalizeOptional(
                params.partyAcronym,
            ),
            partyName: ParliamentarianMandateEntity.normalizeOptional(
                params.partyName,
            ),
            startedAt: params.startedAt,
            endedAt: null,
            status: MandateStatus.ACTIVE,
            isRemoved: false,
            removedAt: null,
            createdAt: now,
            updatedAt: now,
        });
        entity.validate();
        return entity;
    }

    static restore(props: ParliamentarianMandatePrimitives) {
        return new ParliamentarianMandateEntity({
            ...props,
            status: props.status as MandateStatus,
            startedAt: new Date(props.startedAt),
            endedAt: props.endedAt ? new Date(props.endedAt) : null,
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

    get parliamentarianId() {
        return this.props.parliamentarianId;
    }

    get legislatureId() {
        return this.props.legislatureId;
    }

    get status() {
        return this.props.status;
    }

    get isActive() {
        return (
            !this.props.isRemoved &&
            this.props.status === MandateStatus.ACTIVE
        );
    }

    reactivate(params: CreateParliamentarianMandateParams) {
        this.props.status = MandateStatus.ACTIVE;
        this.props.startedAt = params.startedAt;
        this.props.endedAt = null;
        this.props.partyAcronym =
            ParliamentarianMandateEntity.normalizeOptional(
                params.partyAcronym,
            );
        this.props.partyName = ParliamentarianMandateEntity.normalizeOptional(
            params.partyName,
        );
        this.props.isRemoved = false;
        this.props.removedAt = null;
        this.props.updatedAt = new Date();
        this.validate();
    }

    finish(params: FinishParliamentarianMandateParams) {
        this.props.status = params.status;
        this.props.endedAt = params.endedAt;
        this.props.updatedAt = new Date();
        this.validate();
    }

    toPrimitives(): ParliamentarianMandatePrimitives {
        return { ...this.props };
    }

    private validate() {
        if (!this.props.parliamentarianId?.trim()) {
            throw new Error('Parlamentar é obrigatório para mandato');
        }
        if (!this.props.legislatureId?.trim()) {
            throw new Error('Legislatura é obrigatória para mandato');
        }
        if (
            this.props.endedAt &&
            this.props.endedAt.getTime() < this.props.startedAt.getTime()
        ) {
            throw new Error(
                'Data fim do mandato não pode ser anterior à data início',
            );
        }
    }

    private static normalizeOptional(value?: string | null) {
        if (value === undefined || value === null) return null;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
}
