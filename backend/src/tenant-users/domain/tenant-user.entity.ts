import { randomUUID } from 'crypto';
import { BaseAuditFields, BaseEntity } from '../../common/base/base.entity';

export enum TenantUserRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    MEMBER = 'MEMBER',
    VIEWER = 'VIEWER',
}

export enum TenantUserStatus {
    ACTIVE = 'ACTIVE',
    INVITED = 'INVITED',
    DISABLED = 'DISABLED',
}

type TenantUserProps = {
    id: string;
    tenantId: string;
    userId: string;
    role: TenantUserRole;
    status: TenantUserStatus;
    isAdmin: boolean;
    permissions: string[];
    lastAccessAt: Date | null;
};

type TenantUserAuditParams = Partial<BaseAuditFields>;

export type TenantUserPrimitives = TenantUserProps & BaseAuditFields;

type CreateTenantUserParams = TenantUserAuditParams & {
    id?: string;
    tenantId: string;
    userId: string;
    role?: TenantUserRole;
    status?: TenantUserStatus;
    isAdmin?: boolean;
    permissions?: string[];
    lastAccessAt?: Date | null;
};

type UpdateTenantUserParams = {
    role?: TenantUserRole;
    status?: TenantUserStatus;
    isAdmin?: boolean;
    permissions?: string[];
    lastAccessAt?: Date | null;
    modifiedBy?: string | null;
};

export class TenantUserEntity extends BaseEntity {
    private constructor(
        private readonly props: TenantUserProps,
        audit: BaseAuditFields,
    ) {
        super(audit);
    }

    static create(params: CreateTenantUserParams) {
        const role = params.role ?? TenantUserRole.MEMBER;
        const tenantUser = new TenantUserEntity(
            {
                id: params.id ?? randomUUID(),
                tenantId: params.tenantId,
                userId: params.userId,
                role,
                status: params.status ?? TenantUserStatus.ACTIVE,
                isAdmin: params.isAdmin ?? TenantUserEntity.isAdministrativeRole(role),
                permissions: TenantUserEntity.normalizePermissions(
                    params.permissions,
                ),
                lastAccessAt: params.lastAccessAt ?? null,
            },
            TenantUserEntity.buildAuditFields(params),
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
                role: props.role,
                status: props.status,
                isAdmin: props.isAdmin,
                permissions: props.permissions,
                lastAccessAt: props.lastAccessAt ? new Date(props.lastAccessAt) : null,
            },
            {
                createdAt: new Date(props.createdAt),
                createdBy: props.createdBy,
                modifiedAt: new Date(props.modifiedAt),
                modifiedBy: props.modifiedBy,
                isRemoved: props.isRemoved,
            },
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

    update(params: UpdateTenantUserParams) {
        if (params.role !== undefined) {
            this.props.role = params.role;
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

        if (params.isAdmin !== undefined) {
            this.props.isAdmin = params.isAdmin;
        } else if (params.role !== undefined) {
            this.props.isAdmin = TenantUserEntity.isAdministrativeRole(
                this.props.role,
            );
        }

        this.touch(params.modifiedBy);
        this.validate();
    }

    remove(modifiedBy?: string | null) {
        this.markAsRemoved(modifiedBy);
    }

    toPrimitives(): TenantUserPrimitives {
        return {
            ...this.props,
            lastAccessAt: this.props.lastAccessAt
                ? new Date(this.props.lastAccessAt)
                : null,
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

        return [...new Set(permissions.map((permission) => permission.trim()).filter(Boolean))];
    }

    private static isAdministrativeRole(role: TenantUserRole) {
        return role === TenantUserRole.OWNER || role === TenantUserRole.ADMIN;
    }
}
