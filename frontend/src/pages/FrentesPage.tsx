import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import {
    frentesApi,
    type CreateFrontInput,
    type FrenteFiltros,
    type ParliamentaryFront,
} from '../api/legislative/frentes.api';
import { MODULE_ICONS } from '../app/navigation';
import { DataTableLayout } from '../components/common/DataTableLayout';
import { DeleteDialog } from '../components/common/DeleteDialog';
import { FiltroLayout } from '../components/common/FiltroLayout';
import { PageHeader } from '../components/PageHeader';
import {
    emptyFrenteForm,
    FrenteFormDialog,
    STATUS_OPTIONS,
    type FrenteFormState,
} from '../components/frentes/FrenteFormDialog';
import { FrenteVerDialog } from '../components/frentes/FrenteVerDialog';
import { Dropdown, withEmptyOption } from '../components/ui';
import { useAppToast } from '../hooks/useAppToast';
import { usePermissions } from '../hooks/usePermissions';
import { formatDatePt } from '../utils/formatDate';

type Severity = 'success' | 'secondary' | 'danger';

const STATUS_SEVERITY: Record<ParliamentaryFront['status'], Severity> = {
    ACTIVE: 'success',
    INACTIVE: 'secondary',
    FINISHED: 'danger',
};

const STATUS_LABEL: Record<ParliamentaryFront['status'], string> = {
    ACTIVE: 'Ativa',
    INACTIVE: 'Inativa',
    FINISHED: 'Encerrada',
};

const EMPTY_FILTROS: FrenteFiltros = {
    search: '',
    theme: '',
    status: undefined,
    page: 1,
    limit: 20,
};

function toCreatePayload(form: FrenteFormState): CreateFrontInput {
    return {
        name: form.name.trim(),
        theme: form.theme.trim(),
        description: form.description.trim() || undefined,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        status: form.status,
    };
}

export function FrentesPage() {
    const { canWrite, canEdit, canDelete } = usePermissions();
    const { showSuccess, showApiError } = useAppToast();

    const [items, setItems] = useState<ParliamentaryFront[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [saving, setSaving] = useState(false);

    const [filtros, setFiltros] = useState<FrenteFiltros>({ ...EMPTY_FILTROS });
    const [filtrosApplied, setFiltrosApplied] = useState<FrenteFiltros>({ ...EMPTY_FILTROS });

    const [dialogCriar, setDialogCriar] = useState(false);
    const [dialogVerId, setDialogVerId] = useState<string | null>(null);
    const [dialogEditar, setDialogEditar] = useState<ParliamentaryFront | null>(null);
    const [dialogDeletar, setDialogDeletar] = useState<ParliamentaryFront | null>(null);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await frentesApi.list({
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

    async function handleCreate(form: FrenteFormState) {
        setSaving(true);
        try {
            await frentesApi.create(toCreatePayload(form));
            showSuccess('Frente parlamentar cadastrada.');
            setDialogCriar(false);
            void buscar();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    async function handleUpdate(form: FrenteFormState) {
        if (!dialogEditar) return;
        setSaving(true);
        try {
            await frentesApi.update(dialogEditar.id, toCreatePayload(form));
            showSuccess('Frente atualizada.');
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
                header="Nome"
                body={(row: ParliamentaryFront) => (
                    <span className="font-medium">{row.name}</span>
                )}
            />
            <Column header="Tema" body={(row: ParliamentaryFront) => row.theme} style={{ width: '14rem' }} />
            <Column
                header="Situação"
                body={(row: ParliamentaryFront) => (
                    <Tag
                        value={STATUS_LABEL[row.status]}
                        severity={STATUS_SEVERITY[row.status]}
                    />
                )}
                style={{ width: '7rem' }}
            />
            <Column
                header="Início"
                body={(row: ParliamentaryFront) => formatDatePt(row.startDate)}
                style={{ width: '7rem' }}
            />
            <Column
                header="Fim"
                body={(row: ParliamentaryFront) => formatDatePt(row.endDate)}
                style={{ width: '7rem' }}
            />
        </>
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.frentes}
                title="Frentes parlamentares"
                actions={
                    canWrite ? (
                        <Button
                            label="Nova frente"
                            icon="pi pi-plus"
                            onClick={() => setDialogCriar(true)}
                        />
                    ) : undefined
                }
            />

            <section aria-label="Filtros de pesquisa" className="pt-4">
                <FiltroLayout onBuscar={aplicarFiltros} onLimpar={limparFiltros} loading={loading}>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="ff-nome">Nome contém</label>
                        <InputText
                            id="ff-nome"
                            value={filtros.search ?? ''}
                            onChange={(e) => setFiltros((f) => ({ ...f, search: e.target.value }))}
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="ff-tema">Tema contém</label>
                        <InputText
                            id="ff-tema"
                            value={filtros.theme ?? ''}
                            onChange={(e) => setFiltros((f) => ({ ...f, theme: e.target.value }))}
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="ff-status">Situação</label>
                        <Dropdown
                            id="ff-status"
                            value={filtros.status ?? ''}
                            options={withEmptyOption(STATUS_OPTIONS)}
                            onChange={(v) =>
                                setFiltros((f) => ({
                                    ...f,
                                    status: v ? (String(v) as ParliamentaryFront['status']) : undefined,
                                }))
                            }
                            placeholder="Todas"
                        />
                    </div>
                </FiltroLayout>
            </section>

            <section aria-label="Lista de frentes parlamentares" className="frentes-table-section">
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
                <FrenteFormDialog
                    title="Nova frente parlamentar"
                    initial={emptyFrenteForm()}
                    loading={saving}
                    onClose={() => setDialogCriar(false)}
                    onSubmit={(form) => void handleCreate(form)}
                />
            )}

            {dialogVerId && (
                <FrenteVerDialog frenteId={dialogVerId} onClose={() => setDialogVerId(null)} />
            )}

            {dialogEditar && (
                <FrenteFormDialog
                    title={`Editar — ${dialogEditar.name}`}
                    initial={{
                        name: dialogEditar.name,
                        theme: dialogEditar.theme,
                        description: dialogEditar.description ?? '',
                        startDate: dialogEditar.startDate?.split('T')[0] ?? '',
                        endDate: dialogEditar.endDate?.split('T')[0] ?? '',
                        status: dialogEditar.status,
                    }}
                    loading={saving}
                    onClose={() => setDialogEditar(null)}
                    onSubmit={(form) => void handleUpdate(form)}
                />
            )}

            {dialogDeletar && (
                <DeleteDialog
                    visible
                    title="Excluir frente parlamentar"
                    message={`Deseja excluir a frente "${dialogDeletar.name}"? Esta ação não pode ser desfeita.`}
                    onConfirm={async () => {
                        await frentesApi.remove(dialogDeletar.id);
                        void buscar();
                    }}
                    onClose={() => setDialogDeletar(null)}
                />
            )}
        </main>
    );
}
