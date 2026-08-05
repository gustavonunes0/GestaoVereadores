import { randomUUID } from 'crypto';
import { BaseAuditFields, BaseEntity } from '../../../common/base/base.entity';

export enum TenantStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}

export enum TenantPlan {
    BASIC = 'BASIC',
    STANDARD = 'STANDARD',
    PREMIUM = 'PREMIUM',
    CUSTOM = 'CUSTOM',
}

type TenantProps = {
    id: string;
    name: string;
    cnpj: string;
    logo: string | null;
    status: TenantStatus;
    settings: Record<string, unknown> | null;
    tradeName: string | null;
    city: string | null;
    state: string | null;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    plan: TenantPlan;
    contractStartAt: Date | null;
    contractEndAt: Date | null;
    monthlyFeeCents: number;
    billingDay: number;
    maxParliamentarians: number | null;
    notes: string | null;
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
    tradeName?: string | null;
    city?: string | null;
    state?: string | null;
    contactName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    plan?: TenantPlan;
    contractStartAt?: Date | null;
    contractEndAt?: Date | null;
    monthlyFeeCents?: number;
    billingDay?: number;
    maxParliamentarians?: number | null;
    notes?: string | null;
};

type UpdateTenantParams = {
    name?: string;
    cnpj?: string;
    logo?: string | null;
    status?: TenantStatus;
    settings?: Record<string, unknown> | null;
    tradeName?: string | null;
    city?: string | null;
    state?: string | null;
    contactName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    plan?: TenantPlan;
    contractStartAt?: Date | null;
    contractEndAt?: Date | null;
    monthlyFeeCents?: number;
    billingDay?: number;
    maxParliamentarians?: number | null;
    notes?: string | null;
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
                tradeName: TenantEntity.normalizeText(params.tradeName),
                city: TenantEntity.normalizeText(params.city),
                state: TenantEntity.normalizeUf(params.state),
                contactName: TenantEntity.normalizeText(params.contactName),
                contactEmail: TenantEntity.normalizeEmail(params.contactEmail),
                contactPhone: TenantEntity.normalizeText(params.contactPhone),
                plan: params.plan ?? TenantPlan.STANDARD,
                contractStartAt: params.contractStartAt ?? null,
                contractEndAt: params.contractEndAt ?? null,
                monthlyFeeCents: params.monthlyFeeCents ?? 0,
                billingDay: params.billingDay ?? 10,
                maxParliamentarians: params.maxParliamentarians ?? null,
                notes: TenantEntity.normalizeText(params.notes),
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
                tradeName: props.tradeName,
                city: props.city,
                state: props.state,
                contactName: props.contactName,
                contactEmail: props.contactEmail,
                contactPhone: props.contactPhone,
                plan: props.plan,
                contractStartAt: props.contractStartAt,
                contractEndAt: props.contractEndAt,
                monthlyFeeCents: props.monthlyFeeCents,
                billingDay: props.billingDay,
                maxParliamentarians: props.maxParliamentarians,
                notes: props.notes,
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

        if (params.tradeName !== undefined) {
            this.props.tradeName = TenantEntity.normalizeText(params.tradeName);
        }
        if (params.city !== undefined) {
            this.props.city = TenantEntity.normalizeText(params.city);
        }
        if (params.state !== undefined) {
            this.props.state = TenantEntity.normalizeUf(params.state);
        }
        if (params.contactName !== undefined) {
            this.props.contactName = TenantEntity.normalizeText(params.contactName);
        }
        if (params.contactEmail !== undefined) {
            this.props.contactEmail = TenantEntity.normalizeEmail(params.contactEmail);
        }
        if (params.contactPhone !== undefined) {
            this.props.contactPhone = TenantEntity.normalizeText(params.contactPhone);
        }
        if (params.plan !== undefined) {
            this.props.plan = params.plan;
        }
        if (params.contractStartAt !== undefined) {
            this.props.contractStartAt = params.contractStartAt;
        }
        if (params.contractEndAt !== undefined) {
            this.props.contractEndAt = params.contractEndAt;
        }
        if (params.monthlyFeeCents !== undefined) {
            this.props.monthlyFeeCents = params.monthlyFeeCents;
        }
        if (params.billingDay !== undefined) {
            this.props.billingDay = params.billingDay;
        }
        if (params.maxParliamentarians !== undefined) {
            this.props.maxParliamentarians = params.maxParliamentarians;
        }
        if (params.notes !== undefined) {
            this.props.notes = TenantEntity.normalizeText(params.notes);
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

        if (this.props.billingDay < 1 || this.props.billingDay > 28) {
            throw new Error('Dia de cobrança deve estar entre 1 e 28');
        }

        if (this.props.monthlyFeeCents < 0) {
            throw new Error('Mensalidade inválida');
        }

        if (
            this.props.contractStartAt &&
            this.props.contractEndAt &&
            this.props.contractEndAt < this.props.contractStartAt
        ) {
            throw new Error('Fim do contrato não pode ser anterior ao início');
        }

        if (
            this.props.maxParliamentarians != null &&
            this.props.maxParliamentarians < 1
        ) {
            throw new Error('Limite de vereadores deve ser ao menos 1');
        }
    }

    private static normalizeCnpj(cnpj: string) {
        return cnpj.replace(/\D/g, '');
    }

    private static normalizeAsset(asset?: string | null) {
        const normalizedAsset = asset?.trim();
        return normalizedAsset ? normalizedAsset : null;
    }

    private static normalizeText(value?: string | null) {
        const v = value?.trim();
        return v ? v : null;
    }

    private static normalizeEmail(value?: string | null) {
        const v = value?.trim().toLowerCase();
        return v ? v : null;
    }

    private static normalizeUf(value?: string | null) {
        const v = value?.trim().toUpperCase();
        if (!v) return null;
        return v.slice(0, 2);
    }
}
