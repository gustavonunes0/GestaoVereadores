import { useCallback, useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { MODULE_ICONS } from '../app/navigation';
import { tenantPartnersApi, type TenantPartner, type TenantPartnerFiltros } from '../api/tenant-partners.api';
import { PageHeader } from '../components/PageHeader';
import { FiltroLayout } from '../components/common/FiltroLayout';
import { DataTableLayout } from '../components/common/DataTableLayout';
import { DeleteDialog } from '../components/common/DeleteDialog';
import { TenantPartnerCreateDialog } from '../components/autores/TenantPartnerCreateDialog';
import { TenantPartnerVerDialog } from '../components/autores/TenantPartnerVerDialog';
import { TenantPartnerEditDialog } from '../components/autores/TenantPartnerEditDialog';
import { useAppToast } from '../hooks/useAppToast';
import { usePermissions } from '../hooks/usePermissions';
import { formatCpfCnpj } from '../utils/normalizeDocument';

export function AutoresPage() {
    const { canManagePessoas } = usePermissions();
    const { showApiError } = useAppToast();

    const [items, setItems] = useState<TenantPartner[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [filtros, setFiltros] = useState<TenantPartnerFiltros>({});
    const [filtrosApplied, setFiltrosApplied] = useState<TenantPartnerFiltros>({});

    const [dialogCriar, setDialogCriar] = useState(false);
    const [dialogVer, setDialogVer] = useState<TenantPartner | null>(null);
    const [dialogEditar, setDialogEditar] = useState<TenantPartner | null>(null);
    const [dialogDeletar, setDialogDeletar] = useState<TenantPartner | null>(null);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await tenantPartnersApi.list({ ...filtrosApplied, page, limit: 20 });
            setItems(res.data);
            setTotal(res.meta.total);
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [filtrosApplied, page, showApiError]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    function aplicarFiltros() {
        setPage(1);
        setFiltrosApplied({ ...filtros });
    }

    function limparFiltros() {
        setFiltros({});
        setFiltrosApplied({});
        setPage(1);
    }

    const columns = (
        <>
            <Column
                header="Nome"
                body={(row: TenantPartner) => <span className="font-medium">{row.nome}</span>}
            />
            <Column
                header="Cargo"
                body={(row: TenantPartner) => row.cargo ?? '—'}
                style={{ width: '10rem' }}
            />
            <Column
                header="UF"
                body={(row: TenantPartner) => row.uf ?? '—'}
                style={{ width: '4rem' }}
            />
            <Column
                header="Partido"
                body={(row: TenantPartner) => row.partido ?? '—'}
                style={{ width: '8rem' }}
            />
            <Column
                header="Identificação"
                body={(row: TenantPartner) =>
                    row.cpf ? formatCpfCnpj(row.cpf) : '—'
                }
                style={{ width: '11rem' }}
            />
        </>
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.autores}
                title="Instituições parceiras"
                subtitle="Entidades externas à câmara que podem ser vinculadas como autores em matérias."
                actions={
                    (
                        <Button
                            label="Cadastrar instituição"
                            icon="pi pi-plus"
                            onClick={() => setDialogCriar(true)}
                        />
                    )
                }
            />

            <section aria-label="Filtros de pesquisa" className="pt-4">
                <FiltroLayout onBuscar={aplicarFiltros} onLimpar={limparFiltros} loading={loading}>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="tp-filtro-nome">Nome contém</label>
                        <InputText
                            id="tp-filtro-nome"
                            value={filtros.nome ?? ''}
                            onChange={(e) =>
                                setFiltros((f) => ({
                                    ...f,
                                    nome: e.target.value || undefined,
                                }))
                            }
                        />
                    </div>
                </FiltroLayout>
            </section>

            <section aria-label="Lista de instituições parceiras">
                <DataTableLayout<TenantPartner>
                    items={items}
                    total={total}
                    loading={loading}
                    page={page}
                    onPageChange={setPage}
                    columns={columns}
                    canWrite={canManagePessoas}
                    onVer={(item) => setDialogVer(item)}
                    onEditar={canManagePessoas ? (item) => setDialogEditar(item) : undefined}
                    onDeletar={canManagePessoas ? (item) => setDialogDeletar(item) : undefined}
                />
            </section>

            {dialogCriar && (
                <TenantPartnerCreateDialog
                    onClose={() => setDialogCriar(false)}
                    onSaved={() => void buscar()}
                />
            )}

            {dialogVer && (
                <TenantPartnerVerDialog
                    partnerId={dialogVer.id}
                    onClose={() => setDialogVer(null)}
                />
            )}

            {dialogEditar && (
                <TenantPartnerEditDialog
                    partner={dialogEditar}
                    onClose={() => setDialogEditar(null)}
                    onSaved={() => void buscar()}
                />
            )}

            {dialogDeletar && (
                <DeleteDialog
                    visible
                    title="Excluir instituição parceira"
                    message={`Deseja excluir "${dialogDeletar.nome}"? Esta ação não pode ser desfeita.`}
                    onConfirm={() => tenantPartnersApi.remove(dialogDeletar.id)}
                    onClose={() => {
                        setDialogDeletar(null);
                        void buscar();
                    }}
                />
            )}
        </main>
    );
}
