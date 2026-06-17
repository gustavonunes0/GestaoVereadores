import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import {
    comissoesApi,
    type ComissaoFiltros,
    type Committee,
} from '../api/legislative/comissoes.api';
import { MODULE_ICONS } from '../app/navigation';
import { DataTableLayout } from '../components/common/DataTableLayout';
import { DeleteDialog } from '../components/common/DeleteDialog';
import { FiltroLayout } from '../components/common/FiltroLayout';
import { PageHeader } from '../components/PageHeader';
import {
    buildComissaoPayload,
    ComissaoFormDialog,
    comissaoToForm,
    emptyComissaoForm,
    STATUS_OPTIONS,
    TYPE_OPTIONS,
    type ComissaoFormState,
} from '../components/comissoes/ComissaoFormDialog';
import { ComissaoVerDialog } from '../components/comissoes/ComissaoVerDialog';
import { Dropdown, withEmptyOption } from '../components/ui';
import { useAppToast } from '../hooks/useAppToast';
import { usePermissions } from '../hooks/usePermissions';
import { formatDatePt } from '../utils/formatDate';

type Severity = 'success' | 'secondary' | 'danger';

const STATUS_SEVERITY: Record<Committee['status'], Severity> = {
    ACTIVE: 'success',
    INACTIVE: 'secondary',
    FINISHED: 'danger',
};

const EMPTY_FILTROS: ComissaoFiltros = {
    search: '',
    type: undefined,
    status: undefined,
    page: 1,
    limit: 20,
};

export function ComissoesPage() {
    const { canWrite, canEdit, canDelete } = usePermissions();
    const { showSuccess, showApiError } = useAppToast();

    const [items, setItems] = useState<Committee[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [saving, setSaving] = useState(false);

    const [filtros, setFiltros] = useState<ComissaoFiltros>({ ...EMPTY_FILTROS });
    const [filtrosApplied, setFiltrosApplied] = useState<ComissaoFiltros>({ ...EMPTY_FILTROS });

    const [dialogCriar, setDialogCriar] = useState(false);
    const [dialogVerId, setDialogVerId] = useState<string | null>(null);
    const [dialogEditar, setDialogEditar] = useState<Committee | null>(null);
    const [dialogDeletar, setDialogDeletar] = useState<Committee | null>(null);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await comissoesApi.list({
                ...filtrosApplied,
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
    }, [filtrosApplied, page, showApiError]);

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

    async function handleCreate(form: ComissaoFormState) {
        setSaving(true);
        try {
            await comissoesApi.create(buildComissaoPayload(form));
            showSuccess('Comissão cadastrada.');
            setDialogCriar(false);
            void buscar();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    async function handleUpdate(form: ComissaoFormState) {
        if (!dialogEditar) return;
        setSaving(true);
        try {
            await comissoesApi.update(dialogEditar.id, buildComissaoPayload(form));
            showSuccess('Comissão atualizada.');
            setDialogEditar(null);
            void buscar();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    const colunas = (
        <>
            <Column
                header="Sigla"
                body={(row: Committee) => row.acronym ?? '—'}
                style={{ width: '6rem' }}
            />
            <Column
                header="Nome"
                body={(row: Committee) => <span className="font-medium">{row.name}</span>}
            />
            <Column
                header="Tipo"
                body={(row: Committee) =>
                    TYPE_OPTIONS.find((t) => t.value === row.type)?.label ?? row.type
                }
                style={{ width: '9rem' }}
            />
            <Column
                header="Situação"
                body={(row: Committee) => (
                    <Tag
                        value={
                            STATUS_OPTIONS.find((s) => s.value === row.status)?.label ??
                            row.status
                        }
                        severity={STATUS_SEVERITY[row.status]}
                    />
                )}
                style={{ width: '7rem' }}
            />
            <Column
                header="Início"
                body={(row: Committee) => formatDatePt(row.startDate)}
                style={{ width: '7rem' }}
            />
        </>
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.comissoes}
                title="Comissões"
                actions={
                    canWrite ? (
                        <Button
                            label="Nova comissão"
                            icon="pi pi-plus"
                            onClick={() => setDialogCriar(true)}
                        />
                    ) : undefined
                }
            />

            <section aria-label="Filtros de pesquisa" className="pt-4">
                <FiltroLayout onBuscar={aplicarFiltros} onLimpar={limparFiltros} loading={loading}>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="cf-busca">Nome ou sigla</label>
                        <InputText
                            id="cf-busca"
                            value={filtros.search ?? ''}
                            onChange={(e) => setFiltros((f) => ({ ...f, search: e.target.value }))}
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="cf-tipo">Tipo</label>
                        <Dropdown
                            id="cf-tipo"
                            value={filtros.type ?? ''}
                            options={withEmptyOption(TYPE_OPTIONS)}
                            onChange={(v) =>
                                setFiltros((f) => ({
                                    ...f,
                                    type: v ? (String(v) as Committee['type']) : undefined,
                                }))
                            }
                            placeholder="Todos"
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="cf-status">Situação</label>
                        <Dropdown
                            id="cf-status"
                            value={filtros.status ?? ''}
                            options={withEmptyOption(STATUS_OPTIONS)}
                            onChange={(v) =>
                                setFiltros((f) => ({
                                    ...f,
                                    status: v
                                        ? (String(v) as Committee['status'])
                                        : undefined,
                                }))
                            }
                            placeholder="Todas"
                        />
                    </div>
                </FiltroLayout>
            </section>

            <section aria-label="Lista de comissões" className="comissoes-table-section">
                <DataTableLayout
                    items={items}
                    total={total}
                    loading={loading}
                    page={page}
                    onPageChange={setPage}
                    columns={colunas}
                    canWrite={canEdit}
                    onVer={(item) => setDialogVerId(item.id)}
                    onEditar={canEdit ? (item) => setDialogEditar(item) : undefined}
                    onDeletar={canDelete ? (item) => setDialogDeletar(item) : undefined}
                />
            </section>

            {dialogCriar && (
                <ComissaoFormDialog
                    title="Nova comissão"
                    initial={emptyComissaoForm()}
                    loading={saving}
                    onClose={() => setDialogCriar(false)}
                    onSubmit={(form) => void handleCreate(form)}
                />
            )}

            {dialogVerId && (
                <ComissaoVerDialog comissaoId={dialogVerId} onClose={() => setDialogVerId(null)} />
            )}

            {dialogEditar && (
                <ComissaoFormDialog
                    title={`Editar — ${dialogEditar.name}`}
                    initial={comissaoToForm(dialogEditar)}
                    loading={saving}
                    onClose={() => setDialogEditar(null)}
                    onSubmit={(form) => void handleUpdate(form)}
                />
            )}

            {dialogDeletar && (
                <DeleteDialog
                    visible
                    title="Excluir comissão"
                    message={`Deseja excluir a comissão "${dialogDeletar.name}"? Esta ação não pode ser desfeita.`}
                    onConfirm={async () => {
                        await comissoesApi.remove(dialogDeletar.id);
                        void buscar();
                    }}
                    onClose={() => setDialogDeletar(null)}
                />
            )}
        </main>
    );
}
