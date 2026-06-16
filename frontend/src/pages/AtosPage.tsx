import { useCallback, useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { MODULE_ICONS } from '../app/navigation';
import { atosApi, type Ato, type AtoFiltros } from '../api/atos.api';
import { PageHeader } from '../components/PageHeader';
import { FiltroLayout } from '../components/common/FiltroLayout';
import { DataTableLayout } from '../components/common/DataTableLayout';
import { DeleteDialog } from '../components/common/DeleteDialog';
import { AtoVerDialog } from '../components/atos/AtoVerDialog';
import { AtoCreateDialog } from '../components/atos/AtoCreateDialog';
import { PublicacaoModuleIntro } from '../components/publicacao/PublicacaoModuleIntro';
import { ModulePipelineFooter } from '../components/workflow/ModulePipelineFooter';
import { PipelineStepBadge } from '../components/workflow/PipelineStepBadge';
import { PUBLICACAO_MODULES } from '../app/publicacao';
import { WORKFLOW_PIPELINE_TOTAL } from '../app/navigation';
import { useAppToast } from '../hooks/useAppToast';
import { useDominios } from '../hooks/useDominios';
import { usePermissions } from '../hooks/usePermissions';
import { formatDatePt } from '../utils/formatDate';

export function AtosPage() {
    const { canWrite, canDelete } = usePermissions();
    const { showApiError } = useAppToast();
    const { tiposAto } = useDominios();

    const [items, setItems] = useState<Ato[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [filtros, setFiltros] = useState<AtoFiltros>({});
    const [filtrosApplied, setFiltrosApplied] = useState<AtoFiltros>({});

    const [dialogCriar, setDialogCriar] = useState(false);
    const [dialogVer, setDialogVer] = useState<Ato | null>(null);
    const [dialogDeletar, setDialogDeletar] = useState<Ato | null>(null);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await atosApi.list({ ...filtrosApplied, page, limit: 20 });
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
                header="Tipo"
                body={(row: Ato) => <span className="font-medium">{row.tipo.nome}</span>}
                style={{ width: '10rem' }}
            />
            <Column
                header="Classificação"
                body={(row: Ato) => row.classificacao?.nome ?? '—'}
                style={{ width: '11rem' }}
            />
            <Column field="numero" header="Número" style={{ width: '7rem' }} />
            <Column
                header="Ementa"
                body={(row: Ato) => (
                    <span
                        title={row.ementa ?? ''}
                        className="white-space-nowrap overflow-hidden text-overflow-ellipsis block"
                        style={{ maxWidth: '22rem' }}
                    >
                        {row.ementa ?? '—'}
                    </span>
                )}
            />
            <Column
                header="Data do ato"
                body={(row: Ato) => formatDatePt(row.dataAto)}
                style={{ width: '8rem' }}
            />
            <Column
                header="Publicação"
                body={(row: Ato) => formatDatePt(row.dataPublicacao)}
                style={{ width: '7rem' }}
            />
        </>
    );

    const mod = PUBLICACAO_MODULES.atos;

    return (
        <section className="page page--atos">
            <PipelineStepBadge
                step={mod.pipelineStep}
                total={WORKFLOW_PIPELINE_TOTAL}
                label={mod.title}
                domain="administrative"
            />

            <PageHeader
                icon={MODULE_ICONS.atos}
                title="Atos administrativos"
                subtitle="Portarias, nomeações, exonerações, designações e demais atos de gestão administrativa."
                actions={
                    canWrite ? (
                        <Button
                            label="Registrar ato"
                            icon="pi pi-plus"
                            onClick={() => setDialogCriar(true)}
                        />
                    ) : undefined
                }
            />

            <PublicacaoModuleIntro moduleId="atos" />

            <FiltroLayout onBuscar={aplicarFiltros} onLimpar={limparFiltros} loading={loading}>
                <div className="col-12 md:col-4 lg:col-3">
                    <label htmlFor="af-tipo">Tipo</label>
                    <Dropdown
                        id="af-tipo"
                        value={filtros.tipoId ?? ''}
                        options={[{ id: '', nome: 'Todos' }, ...tiposAto]}
                        optionLabel="nome"
                        optionValue="id"
                        onChange={(e) => setFiltros((f) => ({ ...f, tipoId: e.value || undefined }))}
                    />
                </div>
                <div className="col-12 md:col-4 lg:col-3">
                    <label htmlFor="af-numero">Número</label>
                    <InputText
                        id="af-numero"
                        value={filtros.numero ?? ''}
                        onChange={(e) => setFiltros((f) => ({ ...f, numero: e.target.value || undefined }))}
                        placeholder="Número do ato"
                    />
                </div>
                <div className="col-12 md:col-4 lg:col-3">
                    <label htmlFor="af-ementa">Ementa</label>
                    <InputText
                        id="af-ementa"
                        value={filtros.ementa ?? ''}
                        onChange={(e) => setFiltros((f) => ({ ...f, ementa: e.target.value || undefined }))}
                        placeholder="Texto da ementa"
                    />
                </div>
            </FiltroLayout>

            <DataTableLayout<Ato>
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

            {dialogCriar && (
                <AtoCreateDialog
                    onClose={() => setDialogCriar(false)}
                    onSaved={() => void buscar()}
                />
            )}

            {dialogVer && (
                <AtoVerDialog
                    atoId={dialogVer.id}
                    onClose={() => setDialogVer(null)}
                />
            )}

            {dialogDeletar && (
                <DeleteDialog
                    visible
                    title="Excluir ato"
                    message={`Deseja excluir o ato "${dialogDeletar.tipo.nome} nº ${dialogDeletar.numero}"? Esta ação não pode ser desfeita.`}
                    onConfirm={() => atosApi.remove(dialogDeletar.id)}
                    onClose={() => {
                        setDialogDeletar(null);
                        void buscar();
                    }}
                />
            )}

            <ModulePipelineFooter current="atos" />
        </section>
    );
}
