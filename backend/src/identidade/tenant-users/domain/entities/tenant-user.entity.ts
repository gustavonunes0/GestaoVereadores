import { randomUUID } from 'crypto';
import { BaseAuditFields, BaseEntity } from '../../../../common/base/base.entity';

export enum TenantUserStatus {
    ACTIVE = 'ACTIVE',
    INVITED = 'INVITED',
    DISABLED = 'DISABLED',
}

type TenantUserProps = {
    id: string;
    tenantId: string;
    userId: string;
    isTenantAdmin: boolean;
    isTenantStaff: boolean;
    isParliamentarian: boolean;
    status: TenantUserStatus;
    permissions: string[];
    lastAccessAt: Date | null;
    removedAt: Date | null;
};

type TenantUserAuditParams = Partial<BaseAuditFields & { removedAt?: Date | null }>;

export type TenantUserPrimitives = TenantUserProps &
    BaseAuditFields & { removedAt: Date | null };

type CreateTenantUserParams = TenantUserAuditParams & {
    id?: string;
    tenantId: string;
    userId: string;
    isTenantAdmin?: boolean;
    isTenantStaff?: boolean;
    isParliamentarian?: boolean;
    status?: TenantUserStatus;
    permissions?: string[];
    lastAccessAt?: Date | null;
};

type UpdateTenantUserParams = {
    isTenantAdmin?: boolean;
    isTenantStaff?: boolean;
    isParliamentarian?: boolean;
    status?: TenantUserStatus;
    permissions?: string[];
    lastAccessAt?: Date | null;
    modifiedBy?: string | null;
};

export class TenantUserEntity extends BaseEntity {
    private removedAt: Date | null;

    private constructor(
        private readonly props: TenantUserProps,
        audit: BaseAuditFields,
        removedAt: Date | null,
    ) {
        super(audit);
        this.removedAt = removedAt;
    }

    static create(params: CreateTenantUserParams) {
        const tenantUser = new TenantUserEntity(
            {
                id: params.id ?? randomUUID(),
                tenantId: params.tenantId,
                userId: params.userId,
                isTenantAdmin: params.isTenantAdmin ?? false,
                isTenantStaff: params.isTenantStaff ?? false,
                isParliamentarian: params.isParliamentarian ?? false,
                status: params.status ?? TenantUserStatus.ACTIVE,
                permissions: TenantUserEntity.normalizePermissions(
                    params.permissions,
                ),
                lastAccessAt: params.lastAccessAt ?? null,
                removedAt: null,
            },
            TenantUserEntity.buildAuditFields(params),
            null,
        );

        tenantUser.validate();
        return tenantUser;
    }

    static restore(props: TenantUserPrimitives) {
        return new TenantUserEntity(
            {
                id: props.id,
                tenantId: props.tenantId,
                userId: props.userId,
                isTenantAdmin: props.isTenantAdmin,
                isTenantStaff: props.isTenantStaff,
                isParliamentarian: props.isParliamentarian,
                status: props.status,
                permissions: props.permissions,
                lastAccessAt: props.lastAccessAt
                    ? new Date(props.lastAccessAt)
                    : null,
                removedAt: props.removedAt ? new Date(props.removedAt) : null,
            },
            {
                createdAt: new Date(props.createdAt),
                createdBy: props.createdBy,
                modifiedAt: new Date(props.modifiedAt),
                modifiedBy: props.modifiedBy,
                isRemoved: props.isRemoved,
            },
            props.removedAt ? new Date(props.removedAt) : null,
        );
    }

    get id() {
        return this.props.id;
    }

    get tenantId() {
        return this.props.tenantId;
    }

    get userId() {
        return this.props.userId;
    }

    get isParliamentarian() {
        return this.props.isParliamentarian;
    }

    /** Responsável por manter o sistema da Câmara (admin ou staff). */
    get isMaintainer() {
        return this.props.isTenantAdmin || this.props.isTenantStaff;
    }

    update(params: UpdateTenantUserParams) {
        if (params.isTenantAdmin !== undefined) {
            this.props.isTenantAdmin = params.isTenantAdmin;
        }

        if (params.isTenantStaff !== undefined) {
            this.props.isTenantStaff = params.isTenantStaff;
        }

        if (params.isParliamentarian !== undefined) {
            this.props.isParliamentarian = params.isParliamentarian;
        }

        if (params.status !== undefined) {
            this.props.status = params.status;
        }

        if (params.permissions !== undefined) {
            this.props.permissions = TenantUserEntity.normalizePermissions(
                params.permissions,
            );
        }

        if (params.lastAccessAt !== undefined) {
            this.props.lastAccessAt = params.lastAccessAt;
        }

        this.touch(params.modifiedBy);
        this.validate();
    }

    remove(modifiedBy?: string | null) {
        const now = new Date();
        this.markAsRemoved(modifiedBy);
        this.removedAt = now;
        this.props.removedAt = now;
    }

    toPrimitives(): TenantUserPrimitives {
        return {
            ...this.props,
            lastAccessAt: this.props.lastAccessAt
                ? new Date(this.props.lastAccessAt)
                : null,
            removedAt: this.removedAt,
            ...this.toAuditPrimitives(),
        };
    }

    private validate() {
        if (!this.props.tenantId.trim()) {
            throw new Error('Tenant do vínculo é obrigatório');
        }

        if (!this.props.userId.trim()) {
            throw new Error('Usuário do vínculo é obrigatório');
        }
    }

    private static normalizePermissions(permissions?: string[]) {
        if (!permissions?.length) {
            return [];
        }

        return [
            ...new Set(
                permissions
                    .map((permission) => permission.trim())
                    .filter(Boolean),
            ),
        ];
    }
}
