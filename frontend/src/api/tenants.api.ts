import { api } from './client';
import { API_PATHS } from './paths';

export type TenantStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type TenantPlan = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'CUSTOM';
export type TenantPaymentStatus =
    | 'PENDING'
    | 'PAID'
    | 'OVERDUE'
    | 'CANCELLED'
    | 'WAIVED';
export type TenantPaymentMethod =
    | 'PIX'
    | 'BOLETO'
    | 'TRANSFER'
    | 'CARD'
    | 'OTHER';

export type TenantStats = {
    staffUsers: number;
    parliamentarians: number;
    materias: number;
    sessoes: number;
};

export type TenantPayment = {
    id: string;
    competenceMonth: string;
    amountCents: number;
    dueDate: string;
    paidAt: string | null;
    status: TenantPaymentStatus;
    method: TenantPaymentMethod | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
};

export type TenantListItem = {
    id: string;
    name: string;
    cnpj: string;
    logo: string | null;
    status: TenantStatus;
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
    createdAt: string;
    modifiedAt: string;
    stats: TenantStats;
};

export type TenantDetail = TenantListItem & {
    settings: Record<string, unknown> | null;
    recentStaff: Array<{
        id: string;
        nome: string;
        email: string;
        role: string;
        lastAccessAt: string | null;
    }>;
    payments: TenantPayment[];
};

export type UpdateTenantPayload = Partial<{
    name: string;
    cnpj: string;
    status: TenantStatus;
    logo: string | null;
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
}>;

export type ProvisionTenantPayload = {
    name: string;
    cnpj: string;
    logo?: string | null;
    status?: TenantStatus;
    tradeName?: string | null;
    city?: string | null;
    state?: string | null;
    contactName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    plan?: TenantPlan;
    contractStartAt?: string | null;
    contractEndAt?: string | null;
    monthlyFeeCents?: number;
    billingDay?: number;
    maxParliamentarians?: number | null;
    notes?: string | null;
    admin?: {
        firstName: string;
        lastName: string;
        email: string;
        cpf?: string;
        password: string;
    };
};

export type CreateTenantPaymentPayload = {
    competenceMonth: string;
    amountCents: number;
    dueDate: string;
    paidAt?: string | null;
    status?: TenantPaymentStatus;
    method?: TenantPaymentMethod | null;
    notes?: string | null;
};

export type UpdateTenantPaymentPayload = Partial<{
    amountCents: number;
    dueDate: string;
    paidAt: string | null;
    status: TenantPaymentStatus;
    method: TenantPaymentMethod | null;
    notes: string | null;
}>;

export const tenantsApi = {
    list: () => api<TenantListItem[]>(API_PATHS.tenants),

    getById: (id: string) => api<TenantDetail>(API_PATHS.tenantById(id)),

    provision: (body: ProvisionTenantPayload) =>
        api<{
            tenant: TenantListItem;
            admin?: { userId: string; email: string; tenantUserId: string };
        }>(API_PATHS.tenantsProvision, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    update: (id: string, body: UpdateTenantPayload) =>
        api<TenantListItem>(API_PATHS.tenantById(id), {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),

    remove: (id: string) =>
        api<{ success: boolean }>(API_PATHS.tenantById(id), { method: 'DELETE' }),

    listPayments: (id: string) =>
        api<TenantPayment[]>(API_PATHS.tenantPayments(id)),

    createPayment: (id: string, body: CreateTenantPaymentPayload) =>
        api<TenantPayment>(API_PATHS.tenantPayments(id), {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    updatePayment: (id: string, paymentId: string, body: UpdateTenantPaymentPayload) =>
        api<TenantPayment>(API_PATHS.tenantPaymentById(id, paymentId), {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),

    removePayment: (id: string, paymentId: string) =>
        api<{ success: boolean }>(API_PATHS.tenantPaymentById(id, paymentId), {
            method: 'DELETE',
        }),
};
