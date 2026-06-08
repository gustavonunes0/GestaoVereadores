import { randomUUID } from 'crypto';
import { BaseAuditFields, BaseEntity } from '../../../common/base/base.entity';

export enum TenantStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}

type TenantProps = {
    id: string;
    name: string;
    cnpj: string;
    logo: string | null;
    status: TenantStatus;
    settings: Record<string, unknown> | null;
};

type TenantAuditParams = Partial<BaseAuditFields>;

export type TenantPrimitives = TenantProps & BaseAuditFields;

type CreateTenantParams = TenantAuditParams & {
    id?: string;
    name: string;
    cnpj: string;
    logo?: string | null;
    status?: TenantStatus;
    settings?: Record<string, unknown> | null;
};

type UpdateTenantParams = {
    name?: string;
    cnpj?: string;
    logo?: string | null;
    status?: TenantStatus;
    settings?: Record<string, unknown> | null;
    modifiedBy?: string | null;
};

const TENANT_NAME_MIN_LENGTH = 3;
const TENANT_CNPJ_LENGTH = 14;

export class TenantEntity extends BaseEntity {
    private constructor(
        private readonly props: TenantProps,
        audit: BaseAuditFields,
    ) {
        super(audit);
    }

    static create(params: CreateTenantParams) {
        const tenant = new TenantEntity(
            {
                id: params.id ?? randomUUID(),
                name: params.name.trim(),
                cnpj: TenantEntity.normalizeCnpj(params.cnpj),
                logo: TenantEntity.normalizeAsset(params.logo),
                status: params.status ?? TenantStatus.ACTIVE,
                settings: params.settings ?? null,
            },
            TenantEntity.buildAuditFields(params),
        );

        tenant.validate();
        return tenant;
    }

    static restore(props: TenantPrimitives) {
        return new TenantEntity(
            {
                id: props.id,
                name: props.name,
                cnpj: props.cnpj,
                logo: props.logo,
                status: props.status,
                settings: props.settings,
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

    get cnpj() {
        return this.props.cnpj;
    }

    update(params: UpdateTenantParams) {
        if (params.name !== undefined) {
            this.props.name = params.name.trim();
        }

        if (params.cnpj !== undefined) {
            this.props.cnpj = TenantEntity.normalizeCnpj(params.cnpj);
        }

        if (params.logo !== undefined) {
            this.props.logo = TenantEntity.normalizeAsset(params.logo);
        }

        if (params.status !== undefined) {
            this.props.status = params.status;
        }

        if (params.settings !== undefined) {
            this.props.settings = params.settings;
        }

        this.touch(params.modifiedBy);
        this.validate();
    }

    remove(modifiedBy?: string | null) {
        this.markAsRemoved(modifiedBy);
    }

    toPrimitives(): TenantPrimitives {
        return {
            ...this.props,
            ...this.toAuditPrimitives(),
        };
    }

    private validate() {
        if (this.props.name.length < TENANT_NAME_MIN_LENGTH) {
            throw new Error(
                `Nome do tenant deve ter ao menos ${TENANT_NAME_MIN_LENGTH} caracteres`,
            );
        }

        if (this.props.cnpj.length !== TENANT_CNPJ_LENGTH) {
            throw new Error('CNPJ do tenant inválido');
        }
    }

    private static normalizeCnpj(cnpj: string) {
        return cnpj.replace(/\D/g, '');
    }

    private static normalizeAsset(asset?: string | null) {
        const normalizedAsset = asset?.trim();
        return normalizedAsset ? normalizedAsset : null;
    }
}
