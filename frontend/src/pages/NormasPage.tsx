import { useCallback, useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { MODULE_ICONS } from '../app/navigation';
import { normasApi, type Norma, type NormaFiltros } from '../api/normas.api';
import { PageHeader } from '../components/PageHeader';
import { FiltroLayout } from '../components/common/FiltroLayout';
import { DataTableLayout } from '../components/common/DataTableLayout';
import { DeleteDialog } from '../components/common/DeleteDialog';
import { NormaStatusBadge } from '../components/normas/NormaStatusBadge';
import { NormaVerDialog } from '../components/normas/NormaVerDialog';
import { NormaCreateDialog } from '../components/normas/NormaCreateDialog';
import { ModulePipelineFooter } from '../components/workflow/ModulePipelineFooter';
import { Dropdown, mapDropdownOptions, withEmptyOption } from '../components/ui';
import { useAppToast } from '../hooks/useAppToast';
import { useDominios } from '../hooks/useDominios';
import { usePermissions } from '../hooks/usePermissions';
import { formatDatePt } from '../utils/formatDate';

export function NormasPage() {
    const { canDelete } = usePermissions();
    const { showApiError } = useAppToast();
    const { tiposNorma, anos } = useDominios();

    const [items, setItems] = useState<Norma[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [filtros, setFiltros] = useState<NormaFiltros>({});
    const [filtrosApplied, setFiltrosApplied] = useState<NormaFiltros>({});

    const [dialogCriar, setDialogCriar] = useState(false);
    const [dialogVer, setDialogVer] = useState<Norma | null>(null);
    const [dialogDeletar, setDialogDeletar] = useState<Norma | null>(null);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await normasApi.list({ ...filtrosApplied, page, limit: 20 });
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
                header="Espécie"
                body={(row: Norma) => <span className="font-medium">{row.tipo.nome}</span>}
                style={{ width: '10rem' }}
            />
            <Column field="numero" header="Número" style={{ width: '6rem' }} />
            <Column
                header="Ano"
                body={(row: Norma) => row.ano}
                style={{ width: '4.5rem' }}
            />
            <Column
                header="Ementa"
                body={(row: Norma) => (
                    <span
                        title={row.ementa}
                        className="white-space-nowrap overflow-hidden text-overflow-ellipsis block"
                        style={{ maxWidth: '24rem' }}
                    >
                        {row.ementa}
                    </span>
                )}
            />
            <Column
                header="Status"
                body={(row: Norma) => <NormaStatusBadge status={row.statusDerived} />}
                style={{ width: '8rem' }}
            />
            <Column
                header="Publicação"
                body={(row: Norma) => formatDatePt(row.dataPublicacao)}
                style={{ width: '7rem' }}
            />
        </>
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.normas}
                title="Normas jurídicas"
                subtitle="Leis, resoluções, decretos legislativos e demais normas oficiais."
                actions={
                     (
                        <Button
                            label="Registrar norma"
                            icon="pi pi-plus"
                            onClick={() => setDialogCriar(true)}
                        />
                    ) 
                }
            />

            <section aria-label="Filtros de pesquisa" className="pt-4">
                <FiltroLayout onBuscar={aplicarFiltros} onLimpar={limparFiltros} loading={loading}>
                <div className="sigl-filtro-campo">
                    <label htmlFor="nf-tipo">Espécie</label>
                    <Dropdown
                        id="nf-tipo"
                        value={filtros.tipoId ?? ''}
                        options={withEmptyOption(mapDropdownOptions(tiposNorma, 'nome', 'id'))}
                        onChange={(v) => setFiltros((f) => ({ ...f, tipoId: v ? String(v) : undefined }))}
                    />
                </div>
                <div className="sigl-filtro-campo">
                    <label htmlFor="nf-numero">Número</label>
                    <InputText
                        id="nf-numero"
                        value={filtros.numero ?? ''}
                        onChange={(e) => setFiltros((f) => ({ ...f, numero: e.target.value || undefined }))}
                        placeholder="Número da norma"
                    />
                </div>
                <div className="sigl-filtro-campo">
                    <label htmlFor="nf-ementa">Ementa</label>
                    <InputText
                        id="nf-ementa"
                        value={filtros.ementa ?? ''}
                        onChange={(e) => setFiltros((f) => ({ ...f, ementa: e.target.value || undefined }))}
                        placeholder="Texto da ementa"
                    />
                </div>
                <div className="sigl-filtro-campo">
                    <label htmlFor="nf-ano">Ano</label>
                    <Dropdown
                        id="nf-ano"
                        value={filtros.ano ?? ''}
                        options={withEmptyOption(
                            anos.map((a) => ({ label: String(a.valor), value: a.valor })),
                        )}
                        onChange={(v) => setFiltros((f) => ({ ...f, ano: v ? Number(v) : undefined }))}
                    />
                </div>
                </FiltroLayout>
            </section>

            <section aria-label="Lista de normas jurídicas">
                <DataTableLayout<Norma>
                items={items}
                total={total}
                loading={loading}
                page={page}
                onPageChange={setPage}
                columns={columns}
                canWrite={canDelete}
                onVer={(item) => setDialogVer(item)}
                onDeletar={canDelete ? (item) => setDialogDeletar(item) : undefined}
                />
            </section>

            {dialogCriar && (
                <NormaCreateDialog
                    onClose={() => setDialogCriar(false)}
                    onSaved={() => void buscar()}
                />
            )}

            {dialogVer && (
                <NormaVerDialog
                    normaId={dialogVer.id}
                    onClose={() => setDialogVer(null)}
                />
            )}

            {dialogDeletar && (
                <DeleteDialog
                    visible
                    title="Excluir norma"
                    message={`Deseja excluir a norma "${dialogDeletar.tipo.nome} nº ${dialogDeletar.numero}"? Esta ação não pode ser desfeita.`}
                    onConfirm={() => normasApi.remove(dialogDeletar.id)}
                    onClose={() => {
                        setDialogDeletar(null);
                        void buscar();
                    }}
                />
            )}

            <ModulePipelineFooter current="normas" />
        </main>
    );
}
