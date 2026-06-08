import { randomUUID } from 'crypto';
import {
    GuestUserStatus,
    GuestUserType,
} from '../enums/guest-user.enums';

type GuestUserProps = {
    id: string;
    tenantId: string;
    fullName: string;
    cpf: string | null;
    email: string | null;
    phone: string | null;
    type: GuestUserType;
    status: GuestUserStatus;
    organizationName: string | null;
    positionName: string | null;
    notes: string | null;
    isRemoved: boolean;
    removedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export type GuestUserPrimitives = GuestUserProps;

export type CreateGuestUserParams = {
    tenantId: string;
    fullName: string;
    cpf?: string | null;
    email?: string | null;
    phone?: string | null;
    type?: GuestUserType;
    status?: GuestUserStatus;
    organizationName?: string | null;
    positionName?: string | null;
    notes?: string | null;
};

export type UpdateGuestUserParams = Partial<
    Omit<CreateGuestUserParams, 'tenantId'>
>;

export class GuestUserEntity {
    private constructor(private props: GuestUserProps) {}

    static create(params: CreateGuestUserParams) {
        const now = new Date();
        const entity = new GuestUserEntity({
            id: randomUUID(),
            tenantId: params.tenantId,
            fullName: params.fullName.trim(),
            cpf: GuestUserEntity.normalizeCpf(params.cpf),
            email: GuestUserEntity.normalizeOptional(params.email),
            phone: GuestUserEntity.normalizeOptional(params.phone),
            type: params.type ?? GuestUserType.CITIZEN,
            status: params.status ?? GuestUserStatus.ACTIVE,
            organizationName: GuestUserEntity.normalizeOptional(
                params.organizationName,
            ),
            positionName: GuestUserEntity.normalizeOptional(
                params.positionName,
            ),
            notes: GuestUserEntity.normalizeOptional(params.notes),
            isRemoved: false,
            removedAt: null,
            createdAt: now,
            updatedAt: now,
        });
        entity.validate();
        return entity;
    }

    static restore(props: GuestUserPrimitives) {
        return new GuestUserEntity({
            ...props,
            createdAt: new Date(props.createdAt),
            updatedAt: new Date(props.updatedAt),
            removedAt: props.removedAt ? new Date(props.removedAt) : null,
        });
    }

    get id() {
        return this.props.id;
    }

    update(params: UpdateGuestUserParams) {
        if (this.props.isRemoved) {
            throw new Error('Convidado removido não pode ser alterado');
        }
        if (params.fullName !== undefined) {
            this.props.fullName = params.fullName.trim();
        }
        if (params.cpf !== undefined) {
            this.props.cpf = GuestUserEntity.normalizeCpf(params.cpf);
        }
        if (params.email !== undefined) {
            this.props.email = GuestUserEntity.normalizeOptional(params.email);
        }
        if (params.phone !== undefined) {
            this.props.phone = GuestUserEntity.normalizeOptional(params.phone);
        }
        if (params.type !== undefined) {
            this.props.type = params.type;
        }
        if (params.status !== undefined) {
            this.props.status = params.status;
        }
        if (params.organizationName !== undefined) {
            this.props.organizationName = GuestUserEntity.normalizeOptional(
                params.organizationName,
            );
        }
        if (params.positionName !== undefined) {
            this.props.positionName = GuestUserEntity.normalizeOptional(
                params.positionName,
            );
        }
        if (params.notes !== undefined) {
            this.props.notes = GuestUserEntity.normalizeOptional(params.notes);
        }
        this.props.updatedAt = new Date();
        this.validate();
    }

    markAsRemoved() {
        this.props.isRemoved = true;
        this.props.removedAt = new Date();
        this.props.updatedAt = new Date();
    }

    toPrimitives(): GuestUserPrimitives {
        return { ...this.props };
    }

    private validate() {
        if (this.props.fullName.length < 2) {
            throw new Error('Nome completo deve ter ao menos 2 caracteres');
        }
    }

    private static normalizeOptional(value?: string | null) {
        if (value === undefined || value === null) return null;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    private static normalizeCpf(value?: string | null) {
        if (!value) return null;
        const digits = value.replace(/\D/g, '');
        return digits.length > 0 ? digits : null;
    }
}
