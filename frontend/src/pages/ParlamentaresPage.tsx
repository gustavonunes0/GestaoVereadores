import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { apiList } from '../api/client';
import { API_PATHS } from '../api/paths';
import {
    parlamentaresApi,
    type Parliamentarian,
} from '../api/legislative/parlamentares.api';
import { MODULE_ICONS } from '../app/navigation';
import { DataTableLayout } from '../components/common/DataTableLayout';
import { DeleteDialog } from '../components/common/DeleteDialog';
import { FiltroLayout } from '../components/common/FiltroLayout';
import { PageHeader } from '../components/PageHeader';
import { ParlamentarComissoesDialog } from '../components/parlamentares/ParlamentarComissoesDialog';
import { ParlamentarCreateDialog } from '../components/parlamentares/ParlamentarCreateDialog';
import { ParlamentarEditDialog } from '../components/parlamentares/ParlamentarEditDialog';
import { ParlamentarListCard } from '../components/parlamentares/ParlamentarListCard';
import { ParlamentarMandatosDialog } from '../components/parlamentares/ParlamentarMandatosDialog';
import { Dropdown } from '../components/ui';
import { useAppToast } from '../hooks/useAppToast';
import { usePermissions } from '../hooks/usePermissions';

type Partido = { id: string; name: string; acronym: string };
type PartidoOption = { id: string; label: string };

const STATUS_OPTIONS = [
    { label: 'Todos', value: '' },
    { label: 'Ativo', value: 'ACTIVE' },
    { label: 'Inativo', value: 'INACTIVE' },
];

const EMPTY_FILTROS = { search: '', politicalPartyId: '', status: '' };

export function ParlamentaresPage() {
    const { canEdit, canDelete } = usePermissions();
    const { showApiError } = useAppToast();

    const [items, setItems] = useState<Parliamentarian[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [partidoOptions, setPartidoOptions] = useState<PartidoOption[]>([]);
    const [filtros, setFiltros] = useState({ ...EMPTY_FILTROS });
    const [filtrosApplied, setFiltrosApplied] = useState<Record<string, string>>({});

    const [dialogCriar, setDialogCriar] = useState(false);
    const [dialogEditar, setDialogEditar] = useState<Parliamentarian | null>(null);
    const [dialogDeletar, setDialogDeletar] = useState<Parliamentarian | null>(null);
    const [dialogMandatos, setDialogMandatos] = useState<Parliamentarian | null>(null);
    const [dialogComissoes, setDialogComissoes] = useState<Parliamentarian | null>(null);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await parlamentaresApi.list({ ...filtrosApplied, page, limit: 20 });
            setItems(res.data);
            setTotal(res.meta.total);
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [filtrosApplied, page, showApiError]);

    useEffect(() => { void buscar(); }, [buscar]);

    useEffect(() => {
        apiList<Partido>(API_PATHS.partidosPoliticos, { limit: 50 })
            .then((r) =>
                setPartidoOptions([
                    { id: '', label: 'Todos' },
                    ...r.data.map((p) => ({ id: p.id, label: `${p.acronym} — ${p.name}` })),
                ]),
            )
            .catch(() => setPartidoOptions([]));
    }, []);

    function aplicarFiltros() {
        const params: Record<string, string> = {};
        if (filtros.search.trim()) params.search = filtros.search.trim();
        if (filtros.politicalPartyId) params.politicalPartyId = filtros.politicalPartyId;
        if (filtros.status) params.status = filtros.status;
        setPage(1);
        setFiltrosApplied(params);
    }

    function limparFiltros() {
        setFiltros({ ...EMPTY_FILTROS });
        setFiltrosApplied({});
        setPage(1);
    }

    const columns = (
        <Column
            header="Parlamentar"
            body={(row: Parliamentarian) => (
                <ParlamentarListCard
                    row={row}
                    onVerMandatos={setDialogMandatos}
                    onVerComissoes={setDialogComissoes}
                />
            )}
        />
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.parlamentares}
                title="Parlamentares"
                subtitle="Vereadores e deputados vinculados ao tenant."
                actions={
                    canEdit ? (
                        <Button
                            label="Novo Parlamentar"
                            icon="pi pi-plus"
                            onClick={() => setDialogCriar(true)}
                        />
                    ) : undefined
                }
            />

            <section aria-label="Filtros de pesquisa" className="pt-4">
                <FiltroLayout onBuscar={aplicarFiltros} onLimpar={limparFiltros} loading={loading}>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="pf-search">Nome / busca</label>
                        <InputText
                            id="pf-search"
                            value={filtros.search}
                            onChange={(e) => setFiltros((f) => ({ ...f, search: e.target.value }))}
                            placeholder="Nome parlamentar"
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="pf-partido">Partido</label>
                        <Dropdown
                            id="pf-partido"
                            value={filtros.politicalPartyId}
                            options={partidoOptions.map((p) => ({ label: p.label, value: p.id }))}
                            onChange={(v) => setFiltros((f) => ({ ...f, politicalPartyId: String(v) }))}
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="pf-status">Status</label>
                        <Dropdown
                            id="pf-status"
                            value={filtros.status}
                            options={STATUS_OPTIONS}
                            onChange={(v) => setFiltros((f) => ({ ...f, status: String(v) }))}
                        />
                    </div>
                </FiltroLayout>
            </section>

            <section aria-label="Lista de parlamentares" className="parlamentares-table-section">
                <DataTableLayout<Parliamentarian>
                    items={items}
                    total={total}
                    loading={loading}
                    page={page}
                    onPageChange={setPage}
                    columns={columns}
                    canWrite={canEdit}
                    onEditar={canEdit ? setDialogEditar : undefined}
                    onDeletar={canDelete ? setDialogDeletar : undefined}
                />
            </section>

            {dialogCriar && (
                <ParlamentarCreateDialog
                    onClose={() => setDialogCriar(false)}
                    onSaved={() => void buscar()}
                />
            )}
            {dialogEditar && (
                <ParlamentarEditDialog
                    parlamentar={dialogEditar}
                    onClose={() => setDialogEditar(null)}
                    onSaved={() => void buscar()}
                />
            )}
            {dialogDeletar && (
                <DeleteDialog
                    visible
                    title="Excluir parlamentar"
                    message={`Deseja excluir "${dialogDeletar.parliamentaryName}"? Esta ação não pode ser desfeita.`}
                    onConfirm={() => parlamentaresApi.remove(dialogDeletar.id)}
                    onClose={() => {
                        setDialogDeletar(null);
                        void buscar();
                    }}
                />
            )}
            {dialogMandatos && (
                <ParlamentarMandatosDialog
                    parliamentarianId={dialogMandatos.id}
                    parliamentaryName={dialogMandatos.parliamentaryName}
                    onClose={() => setDialogMandatos(null)}
                />
            )}
            {dialogComissoes && (
                <ParlamentarComissoesDialog
                    parliamentarianId={dialogComissoes.id}
                    parliamentaryName={dialogComissoes.parliamentaryName}
                    onClose={() => setDialogComissoes(null)}
                />
            )}
        </main>
    );
}
