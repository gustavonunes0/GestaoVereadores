import { randomUUID } from 'crypto';

type TenantPartnerUserProps = {
    id: string;
    tenantId: string;
    tenantPartnerId: string;
    userId: string;
    isRemoved: boolean;
    removedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export type TenantPartnerUserPrimitives = TenantPartnerUserProps;

type CreateTenantPartnerUserParams = {
    tenantId: string;
    tenantPartnerId: string;
    userId: string;
};

export class TenantPartnerUserEntity {
    private constructor(private readonly props: TenantPartnerUserProps) {}

    static create(params: CreateTenantPartnerUserParams): TenantPartnerUserEntity {
        const now = new Date();
        return new TenantPartnerUserEntity({
            id: randomUUID(),
            tenantId: params.tenantId,
            tenantPartnerId: params.tenantPartnerId,
            userId: params.userId,
            isRemoved: false,
            removedAt: null,
            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: TenantPartnerUserPrimitives): TenantPartnerUserEntity {
        return new TenantPartnerUserEntity(props);
    }

    remove(): void {
        this.props.isRemoved = true;
        this.props.removedAt = new Date();
        this.props.updatedAt = new Date();
    }

    get id() { return this.props.id; }
    get tenantId() { return this.props.tenantId; }
    get tenantPartnerId() { return this.props.tenantPartnerId; }
    get userId() { return this.props.userId; }

    toPrimitives(): TenantPartnerUserPrimitives {
        return { ...this.props };
    }
}
