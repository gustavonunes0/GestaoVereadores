import { TenantPlan, TenantStatus } from '../../domain/tenant.entity';

type PrismaTenantLike = {
    id: string;
    name: string;
    cnpj: string;
    logo: string | null;
    status: string;
    settings: unknown;
    tradeName: string | null;
    city: string | null;
    state: string | null;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    plan: string;
    contractStartAt: Date | null;
    contractEndAt: Date | null;
    monthlyFeeCents: number;
    billingDay: number;
    maxParliamentarians: number | null;
    notes: string | null;
    createdAt: Date;
    createdBy: string | null;
    modifiedAt: Date;
    modifiedBy: string | null;
    isRemoved: boolean;
};

export type TenantCommercialView = {
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
    contractStartAt: string | null;
    contractEndAt: string | null;
    monthlyFeeCents: number;
    billingDay: number;
    maxParliamentarians: number | null;
    notes: string | null;
    createdAt: Date;
    createdBy: string | null;
    modifiedAt: Date;
    modifiedBy: string | null;
};

export function mapTenantCommercialView(t: PrismaTenantLike): TenantCommercialView {
    return {
        id: t.id,
        name: t.name,
        cnpj: t.cnpj,
        logo: t.logo,
        status: t.status as TenantStatus,
        settings:
            t.settings &&
            typeof t.settings === 'object' &&
            !Array.isArray(t.settings)
                ? (t.settings as Record<string, unknown>)
                : null,
        tradeName: t.tradeName,
        city: t.city,
        state: t.state,
        contactName: t.contactName,
        contactEmail: t.contactEmail,
        contactPhone: t.contactPhone,
        plan: t.plan as TenantPlan,
        contractStartAt: t.contractStartAt?.toISOString() ?? null,
        contractEndAt: t.contractEndAt?.toISOString() ?? null,
        monthlyFeeCents: t.monthlyFeeCents,
        billingDay: t.billingDay,
        maxParliamentarians: t.maxParliamentarians,
        notes: t.notes,
        createdAt: t.createdAt,
        createdBy: t.createdBy,
        modifiedAt: t.modifiedAt,
        modifiedBy: t.modifiedBy,
    };
}

/** Normaliza YYYY-MM para o 1º dia do mês em UTC. */
export function competenceMonthToDate(competence: string): Date {
    const [year, month] = competence.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
}

export function formatCompetenceMonth(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}
