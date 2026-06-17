import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { mesaDiretoraApi, type Board, type MesaDiretoraFiltros } from '../api/legislative/mesa-diretora.api';
import { MODULE_ICONS } from '../app/navigation';
import { DataTableLayout } from '../components/common/DataTableLayout';
import { FiltroLayout } from '../components/common/FiltroLayout';
import { PageHeader } from '../components/PageHeader';
import { MesaCreateDialog } from '../components/mesa-diretora/MesaCreateDialog';
import { MesaListCard } from '../components/mesa-diretora/MesaListCard';
import { Dropdown, withEmptyOption } from '../components/ui';
import { useLegislatura } from '../contexts/LegislaturaContext';
import { useAppToast } from '../hooks/useAppToast';
import { usePermissions } from '../hooks/usePermissions';

const STATUS_OPTIONS = [
    { label: 'Ativa', value: 'ACTIVE' },
    { label: 'Inativa', value: 'INACTIVE' },
    { label: 'Encerrada', value: 'FINISHED' },
];

const EMPTY_FILTROS: MesaDiretoraFiltros = {
    status: undefined,
    page: 1,
    limit: 20,
};

export function MesaDiretoraPage() {
    const { legislaturaId, legislaturaAtiva } = useLegislatura();
    const { canWrite } = usePermissions();
    const { showApiError } = useAppToast();

    const [items, setItems] = useState<Board[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [filtros, setFiltros] = useState<MesaDiretoraFiltros>({ ...EMPTY_FILTROS });
    const [filtrosApplied, setFiltrosApplied] = useState<MesaDiretoraFiltros>({ ...EMPTY_FILTROS });

    const [dialogCriar, setDialogCriar] = useState(false);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await mesaDiretoraApi.list({
                ...filtrosApplied,
                ...(legislaturaId ? { legislatureId: legislaturaId } : {}),
                page,
                limit: 20,
            });
            setItems(res.data);
            setTotal(res.meta.total);
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [filtrosApplied, legislaturaId, page, showApiError]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    function aplicarFiltros() {
        setPage(1);
        setFiltrosApplied({ ...filtros });
    }

    function limparFiltros() {
        setFiltros({ ...EMPTY_FILTROS });
        setFiltrosApplied({ ...EMPTY_FILTROS });
        setPage(1);
    }

    const colunas = (
        <Column
            body={(row: Board) => (
                <MesaListCard
                    board={row}
                    legislaturaNumero={legislaturaAtiva?.numero}
                    onChanged={() => void buscar()}
                />
            )}
        />
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.mesaDiretora}
                title="Mesa diretora"
                actions={
                    canWrite ? (
                        <Button
                            label="Nova composição"
                            icon="pi pi-plus"
                            onClick={() => setDialogCriar(true)}
                            disabled={!legislaturaId}
                        />
                    ) : undefined
                }
            />

            <section aria-label="Filtros de pesquisa" className="pt-4">
                <FiltroLayout onBuscar={aplicarFiltros} onLimpar={limparFiltros} loading={loading}>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="md-leg">Legislatura ativa</label>
                        <input
                            id="md-leg"
                            className="p-inputtext w-full"
                            readOnly
                            value={
                                legislaturaAtiva
                                    ? `${legislaturaAtiva.numero}ª legislatura`
                                    : 'Nenhuma legislatura selecionada'
                            }
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="md-status">Situação</label>
                        <Dropdown
                            id="md-status"
                            value={filtros.status ?? ''}
                            options={withEmptyOption(STATUS_OPTIONS)}
                            onChange={(v) =>
                                setFiltros((f) => ({
                                    ...f,
                                    status: v ? String(v) : undefined,
                                }))
                            }
                            placeholder="Todas"
                        />
                    </div>
                </FiltroLayout>
            </section>

            <section aria-label="Lista de composições da mesa diretora" className="mesa-table-section">
                <DataTableLayout
                    items={items}
                    total={total}
                    loading={loading}
                    page={page}
                    onPageChange={setPage}
                    columns={colunas}
                    hideActionsColumn
                    enableSort={false}
                    tableClassName="mesa-datatable mesa-datatable--cards"
                />
            </section>

            {dialogCriar && legislaturaId && (
                <MesaCreateDialog
                    legislatureId={legislaturaId}
                    legislaturaNumero={legislaturaAtiva?.numero}
                    onClose={() => setDialogCriar(false)}
                    onSaved={() => void buscar()}
                />
            )}
        </main>
    );
}
