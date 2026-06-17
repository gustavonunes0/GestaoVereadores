import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { usuariosApi, type TenantStaffUser } from '../api/usuarios.api';
import { MODULE_ICONS } from '../app/navigation';
import { DataTableLayout } from '../components/common/DataTableLayout';
import { PageHeader } from '../components/PageHeader';
import { UsuarioFormDialog } from '../components/usuarios/UsuarioFormDialog';
import { useAppToast } from '../hooks/useAppToast';
import { formatCpf } from '../utils/cpf';

const ROLE_LABELS: Record<TenantStaffUser['role'], string> = {
    ADMIN_STAFF: 'Administrador',
    STAFF: 'Operador',
};

export function UsuariosPage() {
    const { showApiError } = useAppToast();
    const [items, setItems] = useState<TenantStaffUser[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const [dialogCriar, setDialogCriar] = useState(false);
    const [dialogEditar, setDialogEditar] = useState<TenantStaffUser | null>(null);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await usuariosApi.list({ page, limit: 20 });
            setItems(res.data);
            setTotal(res.meta.total);
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [page, showApiError]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    const colunas = (
        <>
            <Column
                header="CPF"
                body={(row: TenantStaffUser) => formatCpf(row.cpf)}
                style={{ width: '9rem' }}
            />
            <Column field="nome" header="Nome" />
            <Column
                header="E-mail"
                body={(row: TenantStaffUser) => (
                    <span
                        className="white-space-nowrap overflow-hidden text-overflow-ellipsis block"
                        style={{ maxWidth: '16rem' }}
                        title={row.email}
                    >
                        {row.email}
                    </span>
                )}
            />
            <Column
                header="Perfil"
                body={(row: TenantStaffUser) => (
                    <span className="badge">{ROLE_LABELS[row.role]}</span>
                )}
                style={{ width: '9rem' }}
            />
            <Column
                header="Ativo"
                body={(row: TenantStaffUser) => (row.ativo ? 'Sim' : 'Não')}
                style={{ width: '5rem' }}
            />
        </>
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.usuarios}
                title="Usuários do sistema"
                actions={
                    <Button
                        label="Novo usuário"
                        icon="pi pi-plus"
                        onClick={() => setDialogCriar(true)}
                    />
                }
            />

            <p className="page-context">
                Cadastre funcionários da câmara com CPF e senha para acesso ao SIGL.
            </p>

            <section aria-label="Lista de usuários" className="pt-4">
                <DataTableLayout
                    items={items}
                    total={total}
                    loading={loading}
                    page={page}
                    onPageChange={setPage}
                    columns={colunas}
                    enableSort={false}
                    canEdit
                    onEditar={(item) => setDialogEditar(item)}
                    hideActionsColumn={false}
                    actionsColumnWidth="5rem"
                />
            </section>

            {dialogCriar && (
                <UsuarioFormDialog
                    mode="create"
                    onClose={() => setDialogCriar(false)}
                    onSaved={() => void buscar()}
                />
            )}

            {dialogEditar && (
                <UsuarioFormDialog
                    mode="edit"
                    usuario={dialogEditar}
                    onClose={() => setDialogEditar(null)}
                    onSaved={() => void buscar()}
                />
            )}
        </main>
    );
}
