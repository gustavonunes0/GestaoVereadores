import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { ROUTES } from '../../app/navigation';
import { tenantsApi, type TenantListItem, type TenantStatus } from '../../api/tenants.api';
import { DataTableLayout } from '../../components/common/DataTableLayout';
import { PageHeader } from '../../components/PageHeader';
import { TenantFormDialog } from '../../components/platform/TenantFormDialog';
import { useAppToast } from '../../hooks/useAppToast';
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

function formatCnpj(cnpj: string): string {
    const d = cnpj.replace(/\D/g, '').padStart(14, '0');
    return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

const PLAN_LABEL: Record<string, string> = {
    BASIC: 'Básico',
    STANDARD: 'Padrão',
    PREMIUM: 'Premium',
    CUSTOM: 'Personalizado',
};

function formatMoney(cents: number): string {
    return (cents / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

export function PlatformTenantsPage() {
    const navigate = useNavigate();
    const { showApiError, showSuccess } = useAppToast();
    const [items, setItems] = useState<TenantListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [page, setPage] = useState(1);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            setItems(await tenantsApi.list());
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [showApiError]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    const totals = useMemo(() => {
        return {
            total: items.length,
            active: items.filter((t) => t.status === 'ACTIVE').length,
            suspended: items.filter((t) => t.status === 'SUSPENDED').length,
        };
    }, [items]);

    async function toggleStatus(row: TenantListItem) {
        const next: TenantStatus = row.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        try {
            await tenantsApi.update(row.id, { status: next });
            showSuccess(
                next === 'ACTIVE' ? 'Cliente reativado.' : 'Cliente suspenso.',
            );
            await buscar();
        } catch (err) {
            showApiError(err);
        }
    }

    const colunas = (
        <>
            <Column
                header="Cliente"
                body={(row: TenantListItem) => {
                    const logo = resolveTenantLogoUrl(row.logo);
                    return (
                        <div className="platform-tenant-logo-cell">
                            {logo ? (
                                <img src={logo} alt="" />
                            ) : (
                                <i className="pi pi-building" aria-hidden />
                            )}
                            <span>{row.name}</span>
                        </div>
                    );
                }}
            />
            <Column
                header="CNPJ"
                body={(row: TenantListItem) => formatCnpj(row.cnpj)}
                style={{ width: '11rem' }}
            />
            <Column
                header="Status"
                body={(row: TenantListItem) => (
                    <Tag
                        value={STATUS_LABEL[row.status]}
                        severity={STATUS_SEVERITY[row.status]}
                    />
                )}
                style={{ width: '8rem' }}
            />
            <Column
                header="Plano"
                body={(row: TenantListItem) => PLAN_LABEL[row.plan] ?? row.plan}
                style={{ width: '7rem' }}
            />
            <Column
                header="Mensalidade"
                body={(row: TenantListItem) => formatMoney(row.monthlyFeeCents ?? 0)}
                style={{ width: '8rem' }}
            />
            <Column
                header="Staff"
                body={(row: TenantListItem) => row.stats.staffUsers}
                style={{ width: '5rem' }}
            />
            <Column
                header="Vereadores"
                body={(row: TenantListItem) => row.stats.parliamentarians}
                style={{ width: '7rem' }}
            />
            <Column
                header="Matérias"
                body={(row: TenantListItem) => row.stats.materias}
                style={{ width: '6rem' }}
            />
            <Column
                header="Sessões"
                body={(row: TenantListItem) => row.stats.sessoes}
                style={{ width: '6rem' }}
            />
            <Column
                header="Status ação"
                body={(row: TenantListItem) => (
                    <Button
                        icon={row.status === 'ACTIVE' ? 'pi pi-ban' : 'pi pi-check'}
                        text
                        rounded
                        size="small"
                        severity={row.status === 'ACTIVE' ? 'warning' : 'success'}
                        aria-label={row.status === 'ACTIVE' ? 'Suspender' : 'Reativar'}
                        onClick={() => void toggleStatus(row)}
                    />
                )}
                style={{ width: '6rem' }}
            />
        </>
    );

    return (
        <main>
            <PageHeader
                title="Clientes"
                subtitle="Tenants da plataforma SaaS"
                icon="pi pi-building"
                actions={
                    <Button
                        label="Novo cliente"
                        icon="pi pi-plus"
                        onClick={() => setDialogOpen(true)}
                    />
                }
            />

            <div className="platform-stats-row">
                <div className="platform-stat-card">
                    <span>Total</span>
                    <strong>{totals.total}</strong>
                </div>
                <div className="platform-stat-card">
                    <span>Ativos</span>
                    <strong>{totals.active}</strong>
                </div>
                <div className="platform-stat-card">
                    <span>Suspensos</span>
                    <strong>{totals.suspended}</strong>
                </div>
            </div>

            <DataTableLayout
                items={items}
                total={items.length}
                loading={loading}
                page={page}
                onPageChange={setPage}
                columns={colunas}
                enableSort={false}
                onVer={(row) => navigate(ROUTES.platform.tenantById(row.id))}
                hideActionsColumn={false}
            />

            <TenantFormDialog
                visible={dialogOpen}
                onHide={() => setDialogOpen(false)}
                onCreated={() => void buscar()}
            />
        </main>
    );
}
