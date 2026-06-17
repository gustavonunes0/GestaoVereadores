import { useCallback, useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { MODULE_ICONS } from '../app/navigation';
import { frentesApi, type ParliamentaryFront, type CreateFrontInput, type FrontStatus } from '../api/legislative/frentes.api';
import { PageHeader } from '../components/PageHeader';
import { DataTableLayout } from '../components/common/DataTableLayout';
import { DeleteDialog } from '../components/common/DeleteDialog';
import { useAppToast } from '../hooks/useAppToast';
import { usePermissions } from '../hooks/usePermissions';
import { formatDatePt } from '../utils/formatDate';

type Severity = 'success' | 'secondary' | 'danger';

const STATUS_LABEL: Record<FrontStatus, string> = {
    ACTIVE: 'Ativa',
    INACTIVE: 'Inativa',
    FINISHED: 'Encerrada',
};

const STATUS_SEVERITY: Record<FrontStatus, Severity> = {
    ACTIVE: 'success',
    INACTIVE: 'secondary',
    FINISHED: 'danger',
};

const STATUS_OPTIONS: { label: string; value: FrontStatus }[] = [
    { label: 'Ativa', value: 'ACTIVE' },
    { label: 'Inativa', value: 'INACTIVE' },
    { label: 'Encerrada', value: 'FINISHED' },
];

interface FrenteFormState {
    name: string;
    theme: string;
    description: string;
    startDate: string;
    endDate: string;
    status: FrontStatus;
}

function emptyForm(): FrenteFormState {
    return { name: '', theme: '', description: '', startDate: '', endDate: '', status: 'ACTIVE' };
}

function FrenteDialog({
    title,
    initial,
    loading,
    onClose,
    onSubmit,
}: {
    title: string;
    initial: FrenteFormState;
    loading: boolean;
    onClose: () => void;
    onSubmit: (form: FrenteFormState) => void;
}) {
    const [form, setForm] = useState<FrenteFormState>(initial);
    const patch = (v: Partial<FrenteFormState>) => setForm((f) => ({ ...f, ...v }));

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={loading} />
            <Button
                label="Salvar"
                icon="pi pi-check"
                loading={loading}
                onClick={() => onSubmit(form)}
                disabled={!form.name.trim() || !form.theme.trim()}
            />
        </div>
    );

    return (
        <Dialog header={title} visible onHide={onClose} style={{ width: 'min(90vw, 600px)' }} footer={footer} modal>
            <div className="sigl-dialog-body">
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Identificação</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="fr-nome">Nome *</label>
                            <InputText id="fr-nome" value={form.name} onChange={(e) => patch({ name: e.target.value })} />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="fr-status">Situação</label>
                            <select
                                id="fr-status"
                                value={form.status}
                                onChange={(e) => patch({ status: e.target.value as FrontStatus })}
                                className="p-inputtext w-full"
                            >
                                {STATUS_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Conteúdo</span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="fr-tema">Tema *</label>
                        <InputText id="fr-tema" value={form.theme} onChange={(e) => patch({ theme: e.target.value })} />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="fr-desc">Descrição</label>
                        <InputTextarea
                            id="fr-desc"
                            value={form.description}
                            onChange={(e) => patch({ description: e.target.value })}
                            rows={3}
                        />
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Período</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="fr-inicio">Data de início</label>
                            <InputText
                                id="fr-inicio"
                                type="date"
                                value={form.startDate}
                                onChange={(e) => patch({ startDate: e.target.value })}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="fr-fim">Data de fim</label>
                            <InputText
                                id="fr-fim"
                                type="date"
                                value={form.endDate}
                                onChange={(e) => patch({ endDate: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}

export function FrentesPage() {
    const { canEdit, canDelete } = usePermissions();
    const { showSuccess, showApiError } = useAppToast();

    const [items, setItems] = useState<ParliamentaryFront[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [saving, setSaving] = useState(false);

    const [dialogCriar, setDialogCriar] = useState(false);
    const [dialogEditar, setDialogEditar] = useState<ParliamentaryFront | null>(null);
    const [dialogDeletar, setDialogDeletar] = useState<ParliamentaryFront | null>(null);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await frentesApi.list({ page, limit: 20 });
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

    async function handleCreate(form: FrenteFormState) {
        setSaving(true);
        const body: CreateFrontInput = {
            name: form.name.trim(),
            theme: form.theme.trim(),
            description: form.description.trim() || undefined,
            startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
            endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
            status: form.status,
        };
        try {
            await frentesApi.create(body);
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
            await frentesApi.update(dialogEditar.id, {
                name: form.name.trim(),
                theme: form.theme.trim(),
                description: form.description.trim() || undefined,
                startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
                endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
                status: form.status,
            });
            showSuccess('Frente atualizada.');
            setDialogEditar(null);
            void buscar();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    const columns = (
        <>
            <Column header="Nome" body={(row: ParliamentaryFront) => <span className="font-medium">{row.name}</span>} />
            <Column header="Tema" body={(row: ParliamentaryFront) => row.theme} style={{ width: '14rem' }} />
            <Column
                header="Situação"
                body={(row: ParliamentaryFront) => (
                    <Tag value={STATUS_LABEL[row.status]} severity={STATUS_SEVERITY[row.status]} />
                )}
                style={{ width: '7rem' }}
            />
            <Column header="Início" body={(row: ParliamentaryFront) => formatDatePt(row.startDate)} style={{ width: '7rem' }} />
            <Column header="Fim" body={(row: ParliamentaryFront) => formatDatePt(row.endDate)} style={{ width: '7rem' }} />
        </>
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.frentes}
                title="Frentes parlamentares"
                subtitle="Grupos temáticos de parlamentares com objetivo legislativo comum."
                actions={
                    <Button label="Adicionar frente" icon="pi pi-plus" onClick={() => setDialogCriar(true)} />
                }
            />

            <section aria-label="Lista de frentes parlamentares" className="pt-4">
                <DataTableLayout<ParliamentaryFront>
                items={items}
                total={total}
                loading={loading}
                page={page}
                onPageChange={setPage}
                columns={columns}
                canWrite={canEdit}
                onEditar={canEdit ? (item) => setDialogEditar(item) : undefined}
                onDeletar={canDelete ? (item) => setDialogDeletar(item) : undefined}
                />
            </section>

            {dialogCriar && (
                <FrenteDialog
                    title="Nova frente parlamentar"
                    initial={emptyForm()}
                    loading={saving}
                    onClose={() => setDialogCriar(false)}
                    onSubmit={(form) => void handleCreate(form)}
                />
            )}

            {dialogEditar && (
                <FrenteDialog
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
                    onConfirm={() => frentesApi.remove(dialogDeletar.id)}
                    onClose={() => {
                        setDialogDeletar(null);
                        void buscar();
                    }}
                />
            )}
        </main>
    );
}
