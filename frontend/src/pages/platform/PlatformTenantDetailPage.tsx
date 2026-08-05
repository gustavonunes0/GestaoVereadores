import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputMask } from 'primereact/inputmask';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { ROUTES } from '../../app/navigation';
import {
    tenantsApi,
    type TenantDetail,
    type TenantPayment,
    type TenantPaymentStatus,
    type TenantPlan,
    type TenantStatus,
} from '../../api/tenants.api';
import { PageHeader } from '../../components/PageHeader';
import { TenantPaymentDialog } from '../../components/platform/TenantPaymentDialog';
import { Dropdown, FileUpload, withEmptyOption } from '../../components/ui';
import { useAppToast } from '../../hooks/useAppToast';
import { MAX_PHOTO_BYTES, preparePhotoDataUrl } from '../../utils/fileToDataUrl';
import { resolveTenantLogoUrl } from '../../utils/tenantLogo';

const STATUS_SEVERITY: Record<TenantStatus, 'success' | 'warning' | 'danger'> = {
    ACTIVE: 'success',
    INACTIVE: 'warning',
    SUSPENDED: 'danger',
};

const STATUS_LABEL: Record<TenantStatus, string> = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    SUSPENDED: 'Suspenso',
};

const PLAN_OPTIONS: Array<{ label: string; value: TenantPlan }> = [
    { label: 'Básico', value: 'BASIC' },
    { label: 'Padrão', value: 'STANDARD' },
    { label: 'Premium', value: 'PREMIUM' },
    { label: 'Personalizado', value: 'CUSTOM' },
];

const PLAN_LABEL: Record<TenantPlan, string> = {
    BASIC: 'Básico',
    STANDARD: 'Padrão',
    PREMIUM: 'Premium',
    CUSTOM: 'Personalizado',
};

const PAYMENT_STATUS_LABEL: Record<TenantPaymentStatus, string> = {
    PENDING: 'Pendente',
    PAID: 'Pago',
    OVERDUE: 'Atrasado',
    CANCELLED: 'Cancelado',
    WAIVED: 'Isento',
};

const PAYMENT_STATUS_SEVERITY: Record<
    TenantPaymentStatus,
    'success' | 'warning' | 'danger' | 'secondary' | 'info'
> = {
    PENDING: 'warning',
    PAID: 'success',
    OVERDUE: 'danger',
    CANCELLED: 'secondary',
    WAIVED: 'info',
};

const UF_OPTIONS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
].map((uf) => ({ label: uf, value: uf }));

function formatCnpj(cnpj: string): string {
    const d = cnpj.replace(/\D/g, '').padStart(14, '0');
    return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function formatMoney(cents: number): string {
    return (cents / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function toDateInput(iso: string | null | undefined): Date | null {
    if (!iso) return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
}

function toIsoDate(date: Date | null): string | null {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function PlatformTenantDetailPage() {
    const { id = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showApiError, showSuccess } = useAppToast();
    const [tenant, setTenant] = useState<TenantDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [tradeName, setTradeName] = useState('');
    const [city, setCity] = useState('');
    const [stateUf, setStateUf] = useState<string | null>(null);
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [plan, setPlan] = useState<TenantPlan>('STANDARD');
    const [contractStart, setContractStart] = useState<Date | null>(null);
    const [contractEnd, setContractEnd] = useState<Date | null>(null);
    const [monthlyFee, setMonthlyFee] = useState<number | null>(0);
    const [billingDay, setBillingDay] = useState<number | null>(10);
    const [maxParliamentarians, setMaxParliamentarians] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoRemoved, setLogoRemoved] = useState(false);

    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<TenantPayment | null>(null);

    const fillForm = useCallback((t: TenantDetail) => {
        setName(t.name);
        setCnpj(formatCnpj(t.cnpj));
        setTradeName(t.tradeName ?? '');
        setCity(t.city ?? '');
        setStateUf(t.state);
        setContactName(t.contactName ?? '');
        setContactEmail(t.contactEmail ?? '');
        setContactPhone(t.contactPhone ?? '');
        setPlan(t.plan);
        setContractStart(toDateInput(t.contractStartAt));
        setContractEnd(toDateInput(t.contractEndAt));
        setMonthlyFee(t.monthlyFeeCents / 100);
        setBillingDay(t.billingDay);
        setMaxParliamentarians(t.maxParliamentarians);
        setNotes(t.notes ?? '');
        setLogoUrl(resolveTenantLogoUrl(t.logo));
        setLogoFile(null);
        setLogoRemoved(false);
    }, []);

    const buscar = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await tenantsApi.getById(id);
            setTenant(data);
            fillForm(data);
        } catch (err) {
            showApiError(err);
            setTenant(null);
        } finally {
            setLoading(false);
        }
    }, [id, showApiError, fillForm]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    async function toggleStatus() {
        if (!tenant) return;
        const next: TenantStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        try {
            await tenantsApi.update(tenant.id, { status: next });
            showSuccess(next === 'ACTIVE' ? 'Cliente reativado.' : 'Cliente suspenso.');
            await buscar();
        } catch (err) {
            showApiError(err);
        }
    }

    async function handleSave(e: FormEvent) {
        e.preventDefault();
        if (!tenant) return;
        setSaving(true);
        try {
            let logo: string | null | undefined;
            if (logoFile) {
                if (logoFile.size > MAX_PHOTO_BYTES) {
                    throw new Error('A logo deve ter no máximo 2 MB.');
                }
                logo = await preparePhotoDataUrl(logoFile);
            } else if (logoRemoved) {
                logo = null;
            }

            await tenantsApi.update(tenant.id, {
                name: name.trim(),
                cnpj,
                ...(logo !== undefined ? { logo } : {}),
                tradeName: tradeName.trim() || null,
                city: city.trim() || null,
                state: stateUf,
                contactName: contactName.trim() || null,
                contactEmail: contactEmail.trim() || null,
                contactPhone: contactPhone.trim() || null,
                plan,
                contractStartAt: toIsoDate(contractStart),
                contractEndAt: toIsoDate(contractEnd),
                monthlyFeeCents: Math.round((monthlyFee ?? 0) * 100),
                billingDay: billingDay ?? 10,
                maxParliamentarians: maxParliamentarians ?? null,
                notes: notes.trim() || null,
            });
            showSuccess('Dados do cliente atualizados.');
            await buscar();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    async function markPaid(payment: TenantPayment) {
        if (!tenant) return;
        try {
            await tenantsApi.updatePayment(tenant.id, payment.id, {
                status: 'PAID',
                paidAt: new Date().toISOString().slice(0, 10),
            });
            showSuccess('Pagamento marcado como pago.');
            await buscar();
        } catch (err) {
            showApiError(err);
        }
    }

    async function removePayment(payment: TenantPayment) {
        if (!tenant) return;
        if (!window.confirm(`Remover pagamento de ${payment.competenceMonth}?`)) return;
        try {
            await tenantsApi.removePayment(tenant.id, payment.id);
            showSuccess('Pagamento removido.');
            await buscar();
        } catch (err) {
            showApiError(err);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-content-center py-6">
                <ProgressSpinner />
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="flex flex-column align-items-center gap-2 py-6">
                <span>Cliente não encontrado.</span>
                <Button
                    label="Voltar"
                    text
                    onClick={() => navigate(ROUTES.platform.tenants)}
                />
            </div>
        );
    }

    return (
        <main>
            <PageHeader
                title={tenant.name}
                subtitle={formatCnpj(tenant.cnpj)}
                icon="pi pi-building"
                actions={
                    <div className="flex gap-2 align-items-center">
                        {resolveTenantLogoUrl(tenant.logo) ? (
                            <img
                                src={resolveTenantLogoUrl(tenant.logo)!}
                                alt={`Logo ${tenant.name}`}
                                className="platform-tenant-logo-thumb"
                            />
                        ) : null}
                        <Button
                            label="Voltar"
                            icon="pi pi-arrow-left"
                            outlined
                            severity="secondary"
                            onClick={() => navigate(ROUTES.platform.tenants)}
                        />
                        <Button
                            label={tenant.status === 'ACTIVE' ? 'Suspender' : 'Reativar'}
                            icon={tenant.status === 'ACTIVE' ? 'pi pi-ban' : 'pi pi-check'}
                            severity={tenant.status === 'ACTIVE' ? 'warning' : 'success'}
                            onClick={() => void toggleStatus()}
                        />
                    </div>
                }
            />

            <div className="platform-detail-meta">
                <Tag
                    value={STATUS_LABEL[tenant.status]}
                    severity={STATUS_SEVERITY[tenant.status]}
                />
                <Tag value={PLAN_LABEL[tenant.plan]} severity="info" />
                <span>
                    Mensalidade {formatMoney(tenant.monthlyFeeCents)} · dia {tenant.billingDay}
                </span>
                <span>
                    Criado em {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                </span>
            </div>

            <div className="platform-stats-row">
                <div className="platform-stat-card">
                    <span>Staff</span>
                    <strong>{tenant.stats.staffUsers}</strong>
                </div>
                <div className="platform-stat-card">
                    <span>Vereadores</span>
                    <strong>{tenant.stats.parliamentarians}</strong>
                </div>
                <div className="platform-stat-card">
                    <span>Matérias</span>
                    <strong>{tenant.stats.materias}</strong>
                </div>
                <div className="platform-stat-card">
                    <span>Sessões</span>
                    <strong>{tenant.stats.sessoes}</strong>
                </div>
            </div>

            <section className="parl-sessao-panel">
                <h3 className="parl-sessao-panel__title">Dados comerciais</h3>
                <form className="platform-tenant-form" onSubmit={(e) => void handleSave(e)}>
                    <div className="sigl-dialog-secao">
                        <span className="sigl-dialog-secao-titulo">Identificação</span>
                        <div className="sigl-filtro-campo platform-tenant-logo-field">
                            <FileUpload
                                id="t-logo"
                                label="Logo da câmara"
                                accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                                value={logoFile ?? (logoRemoved ? null : logoUrl)}
                                onChange={(file) => {
                                    setLogoFile(file);
                                    setLogoRemoved(file == null);
                                    if (file == null) setLogoUrl(null);
                                }}
                            />
                        </div>
                        <div className="sigl-dialog-grid sigl-dialog-grid-2">
                            <div className="sigl-filtro-campo">
                                <label htmlFor="t-name">Nome da câmara</label>
                                <InputText
                                    id="t-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full"
                                    required
                                    minLength={3}
                                />
                            </div>
                            <div className="sigl-filtro-campo">
                                <label htmlFor="t-cnpj">CNPJ</label>
                                <InputMask
                                    id="t-cnpj"
                                    mask="99.999.999/9999-99"
                                    value={cnpj}
                                    onChange={(e) => setCnpj(e.value ?? '')}
                                    className="w-full"
                                    required
                                />
                            </div>
                            <div className="sigl-filtro-campo">
                                <label htmlFor="t-trade">Nome fantasia</label>
                                <InputText
                                    id="t-trade"
                                    value={tradeName}
                                    onChange={(e) => setTradeName(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="sigl-dialog-grid sigl-dialog-grid-2">
                                <div className="sigl-filtro-campo">
                                    <label htmlFor="t-city">Cidade</label>
                                    <InputText
                                        id="t-city"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="sigl-filtro-campo">
                                    <label htmlFor="t-uf">UF</label>
                                    <Dropdown
                                        id="t-uf"
                                        value={stateUf ?? ''}
                                        options={withEmptyOption(UF_OPTIONS, '—', '')}
                                        onChange={(v) =>
                                            setStateUf(v ? String(v) : null)
                                        }
                                        placeholder="UF"
                                        filter
                                        filterPlaceholder="Buscar UF..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sigl-dialog-secao">
                        <span className="sigl-dialog-secao-titulo">Contato comercial</span>
                        <div className="sigl-dialog-grid sigl-dialog-grid-3">
                            <div className="sigl-filtro-campo">
                                <label htmlFor="t-contact">Contato</label>
                                <InputText
                                    id="t-contact"
                                    value={contactName}
                                    onChange={(e) => setContactName(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="sigl-filtro-campo">
                                <label htmlFor="t-email">E-mail</label>
                                <InputText
                                    id="t-email"
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="sigl-filtro-campo">
                                <label htmlFor="t-phone">Telefone</label>
                                <InputText
                                    id="t-phone"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="sigl-dialog-secao">
                        <span className="sigl-dialog-secao-titulo">Contrato e cobrança</span>
                        <div className="sigl-dialog-grid sigl-dialog-grid-2">
                            <div className="sigl-filtro-campo">
                                <label htmlFor="t-plan">Plano</label>
                                <Dropdown
                                    id="t-plan"
                                    value={plan}
                                    options={PLAN_OPTIONS}
                                    onChange={(v) => setPlan(v as TenantPlan)}
                                    placeholder="Selecione o plano"
                                />
                            </div>
                            <div className="sigl-filtro-campo">
                                <label htmlFor="t-fee">Mensalidade</label>
                                <InputNumber
                                    id="t-fee"
                                    value={monthlyFee}
                                    onValueChange={(e) => setMonthlyFee(e.value ?? null)}
                                    mode="currency"
                                    currency="BRL"
                                    locale="pt-BR"
                                    className="w-full"
                                    inputClassName="w-full"
                                />
                            </div>
                            <div className="sigl-filtro-campo">
                                <label htmlFor="t-billing">Dia de cobrança</label>
                                <InputNumber
                                    id="t-billing"
                                    value={billingDay}
                                    onValueChange={(e) => setBillingDay(e.value ?? null)}
                                    min={1}
                                    max={28}
                                    className="w-full"
                                    inputClassName="w-full"
                                />
                            </div>
                            <div className="sigl-filtro-campo">
                                <label htmlFor="t-max">Limite de vereadores</label>
                                <InputNumber
                                    id="t-max"
                                    value={maxParliamentarians}
                                    onValueChange={(e) => setMaxParliamentarians(e.value ?? null)}
                                    min={1}
                                    className="w-full"
                                    inputClassName="w-full"
                                    placeholder="Sem limite"
                                />
                            </div>
                            <div className="sigl-filtro-campo">
                                <label htmlFor="t-start">Início do contrato</label>
                                <Calendar
                                    id="t-start"
                                    value={contractStart}
                                    onChange={(e) => setContractStart(e.value as Date | null)}
                                    dateFormat="dd/mm/yy"
                                    className="w-full"
                                    inputClassName="w-full"
                                    showButtonBar
                                />
                            </div>
                            <div className="sigl-filtro-campo">
                                <label htmlFor="t-end">Fim do contrato</label>
                                <Calendar
                                    id="t-end"
                                    value={contractEnd}
                                    onChange={(e) => setContractEnd(e.value as Date | null)}
                                    dateFormat="dd/mm/yy"
                                    className="w-full"
                                    inputClassName="w-full"
                                    showButtonBar
                                />
                            </div>
                        </div>
                    </div>

                    <div className="sigl-dialog-secao">
                        <span className="sigl-dialog-secao-titulo">Observações</span>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="t-notes">Observações internas</label>
                            <InputTextarea
                                id="t-notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full"
                                rows={3}
                                placeholder="Acordos, condições especiais, histórico..."
                            />
                        </div>
                    </div>

                    <div className="platform-tenant-form__actions">
                        <Button
                            type="submit"
                            label="Salvar alterações"
                            icon="pi pi-save"
                            loading={saving}
                        />
                    </div>
                </form>
            </section>

            <section className="parl-sessao-panel">
                <div className="platform-section-head">
                    <h3 className="parl-sessao-panel__title m-0">Pagamentos mensais</h3>
                    <Button
                        label="Novo pagamento"
                        icon="pi pi-plus"
                        size="small"
                        onClick={() => {
                            setEditingPayment(null);
                            setPaymentDialogOpen(true);
                        }}
                    />
                </div>

                {tenant.payments.length === 0 ? (
                    <p className="parl-sessao-panel__hint m-0">
                        Nenhum pagamento registrado ainda.
                    </p>
                ) : (
                    <div className="platform-payments-table-wrap">
                        <table className="platform-payments-table">
                            <thead>
                                <tr>
                                    <th>Competência</th>
                                    <th>Valor</th>
                                    <th>Vencimento</th>
                                    <th>Status</th>
                                    <th>Pago em</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {tenant.payments.map((p) => (
                                    <tr key={p.id}>
                                        <td>{p.competenceMonth}</td>
                                        <td>{formatMoney(p.amountCents)}</td>
                                        <td>
                                            {new Date(p.dueDate).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td>
                                            <Tag
                                                value={PAYMENT_STATUS_LABEL[p.status]}
                                                severity={PAYMENT_STATUS_SEVERITY[p.status]}
                                            />
                                        </td>
                                        <td>
                                            {p.paidAt
                                                ? new Date(p.paidAt).toLocaleDateString('pt-BR')
                                                : '—'}
                                        </td>
                                        <td className="platform-payments-actions">
                                            {p.status !== 'PAID' ? (
                                                <Button
                                                    icon="pi pi-check"
                                                    text
                                                    rounded
                                                    size="small"
                                                    severity="success"
                                                    aria-label="Marcar pago"
                                                    onClick={() => void markPaid(p)}
                                                />
                                            ) : null}
                                            <Button
                                                icon="pi pi-pencil"
                                                text
                                                rounded
                                                size="small"
                                                aria-label="Editar"
                                                onClick={() => {
                                                    setEditingPayment(p);
                                                    setPaymentDialogOpen(true);
                                                }}
                                            />
                                            <Button
                                                icon="pi pi-trash"
                                                text
                                                rounded
                                                size="small"
                                                severity="danger"
                                                aria-label="Remover"
                                                onClick={() => void removePayment(p)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="parl-sessao-panel">
                <h3 className="parl-sessao-panel__title">Usuários staff recentes</h3>
                {tenant.recentStaff.length === 0 ? (
                    <p className="parl-sessao-panel__hint m-0">Nenhum usuário staff.</p>
                ) : (
                    <ul className="platform-staff-list">
                        {tenant.recentStaff.map((u) => (
                            <li key={u.id}>
                                <div>
                                    <strong>{u.nome}</strong>
                                    <span>{u.email}</span>
                                </div>
                                <span className="badge">{u.role}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <TenantPaymentDialog
                visible={paymentDialogOpen}
                tenantId={tenant.id}
                payment={editingPayment}
                defaultAmountCents={tenant.monthlyFeeCents}
                onHide={() => setPaymentDialogOpen(false)}
                onSaved={() => void buscar()}
            />
        </main>
    );
}
