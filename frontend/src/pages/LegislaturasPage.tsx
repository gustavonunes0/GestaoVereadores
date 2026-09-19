import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { MODULE_ICONS } from '../app/navigation';
import {
    legislaturasApi,
    type Legislature,
} from '../api/legislative/legislaturas.api';
import { DataTableLayout } from '../components/common/DataTableLayout';
import { DeleteDialog } from '../components/common/DeleteDialog';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { Dropdown } from '../components/ui';
import { useLegislatura } from '../contexts/LegislaturaContext';
import { useAppToast } from '../hooks/useAppToast';
import { usePermissions } from '../hooks/usePermissions';
import { formatDatePt } from '../utils/formatDate';

const SITUACAO_OPTIONS = [
    { label: 'Ativa', value: 'ativa' },
    { label: 'Inativa', value: 'inativa' },
];

function toDateInput(value?: string | null): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
}

type FormState = {
    number: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
};

const EMPTY_FORM: FormState = {
    number: '6',
    startDate: '2025-01-01',
    endDate: '2028-12-31',
    isCurrent: true,
};

export function LegislaturasPage() {
    const { refresh, setLegislaturaId } = useLegislatura();
    const { canWrite, canEdit, canDelete } = usePermissions();
    const { showApiError } = useAppToast();

    const [items, setItems] = useState<Legislature[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [dialogCriar, setDialogCriar] = useState(false);
    const [dialogEditar, setDialogEditar] = useState<Legislature | null>(null);
    const [dialogDeletar, setDialogDeletar] = useState<Legislature | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await legislaturasApi.list({ page, limit: 20 });
            setItems(res.data);
            setTotal(res.meta.total);
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [page, showApiError]);

    useEffect(() => {
        void load();
    }, [load]);

    async function afterSave(markCurrent: boolean) {
        const list = await refresh();
        if (markCurrent) {
            const atual = list.find((l) => l.isCurrent);
            if (atual) setLegislaturaId(atual.id);
        }
        await load();
    }

    function openCreate() {
        setForm(EMPTY_FORM);
        setDialogCriar(true);
    }

    function openEdit(row: Legislature) {
        setForm({
            number: String(row.number),
            startDate: toDateInput(row.startDate),
            endDate: toDateInput(row.endDate),
            isCurrent: row.isCurrent,
        });
        setDialogEditar(row);
    }

    async function handleCreate(e: FormEvent) {
        e.preventDefault();
        try {
            await legislaturasApi.create({
                number: Number(form.number),
                startDate: new Date(form.startDate).toISOString(),
                endDate: new Date(form.endDate).toISOString(),
                isCurrent: form.isCurrent,
            });
            setDialogCriar(false);
            await afterSave(form.isCurrent);
        } catch (err) {
            showApiError(err);
        }
    }

    async function handleUpdate(e: FormEvent) {
        e.preventDefault();
        if (!dialogEditar) return;
        try {
            await legislaturasApi.update(dialogEditar.id, {
                number: Number(form.number),
                startDate: new Date(form.startDate).toISOString(),
                endDate: new Date(form.endDate).toISOString(),
                isCurrent: form.isCurrent,
            });
            setDialogEditar(null);
            await afterSave(form.isCurrent);
        } catch (err) {
            showApiError(err);
        }
    }

    const columns = (
        <>
            <Column
                header="Número"
                body={(row: Legislature) => `${row.number}ª`}
            />
            <Column
                header="Início"
                body={(row: Legislature) => formatDatePt(row.startDate)}
            />
            <Column
                header="Fim"
                body={(row: Legislature) => formatDatePt(row.endDate)}
            />
            <Column
                header="Situação"
                body={(row: Legislature) => (
                    <Tag
                        value={row.isCurrent ? 'Ativa' : 'Inativa'}
                        severity={row.isCurrent ? 'success' : 'secondary'}
                        className="text-xs"
                    />
                )}
            />
        </>
    );

    /** Mesmos campos em Nova e Editar: número, situação, datas. */
    const formFields = (
        <div className="sigl-dialog-body">
            <div className="sigl-dialog-secao">
                <span className="sigl-dialog-secao-titulo">Identificação</span>
                <div className="sigl-dialog-grid sigl-dialog-grid-2">
                    <div className="sigl-filtro-campo">
                        <label htmlFor="leg-numero">Número *</label>
                        <InputText
                            id="leg-numero"
                            type="number"
                            value={form.number}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, number: e.target.value }))
                            }
                            required
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="leg-situacao">Situação *</label>
                        <Dropdown
                            id="leg-situacao"
                            value={form.isCurrent ? 'ativa' : 'inativa'}
                            options={SITUACAO_OPTIONS}
                            onChange={(v) =>
                                setForm((f) => ({
                                    ...f,
                                    isCurrent: String(v) === 'ativa',
                                }))
                            }
                            placeholder="Selecione"
                        />
                    </div>
                </div>
            </div>
            <div className="sigl-dialog-secao">
                <span className="sigl-dialog-secao-titulo">Período</span>
                <div className="sigl-dialog-grid sigl-dialog-grid-2">
                    <div className="sigl-filtro-campo">
                        <label htmlFor="leg-inicio">Data início *</label>
                        <InputText
                            id="leg-inicio"
                            type="date"
                            value={form.startDate}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    startDate: e.target.value,
                                }))
                            }
                            required
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="leg-fim">Data fim *</label>
                        <InputText
                            id="leg-fim"
                            type="date"
                            value={form.endDate}
                            min={form.startDate}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    endDate: e.target.value,
                                }))
                            }
                            required
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.legislaturas}
                title="Legislaturas"
                subtitle="Períodos legislativos e legislatura vigente da câmara."
                actions={
                    canWrite ? (
                        <Button
                            label="Nova legislatura"
                            icon="pi pi-plus"
                            onClick={openCreate}
                        />
                    ) : undefined
                }
            />

            <section aria-label="Lista de legislaturas" className="pt-4">
                <DataTableLayout<Legislature>
                    items={items}
                    total={total}
                    loading={loading}
                    page={page}
                    onPageChange={setPage}
                    columns={columns}
                    enableSort={false}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onEditar={canEdit ? openEdit : undefined}
                    onDeletar={canDelete ? setDialogDeletar : undefined}
                    actionsColumnWidth="6rem"
                />
            </section>

            {dialogCriar && (
                <Modal title="Nova legislatura" onClose={() => setDialogCriar(false)}>
                    <form onSubmit={handleCreate}>
                        {formFields}
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setDialogCriar(false)}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Salvar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {dialogEditar && (
                <Modal
                    title={`Editar legislatura ${dialogEditar.number}ª`}
                    onClose={() => setDialogEditar(null)}
                >
                    <form onSubmit={handleUpdate}>
                        {formFields}
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setDialogEditar(null)}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Salvar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {dialogDeletar && (
                <DeleteDialog
                    visible
                    title="Excluir legislatura"
                    message={`Deseja excluir a ${dialogDeletar.number}ª legislatura? Esta ação não pode ser desfeita.`}
                    onConfirm={async () => {
                        await legislaturasApi.remove(dialogDeletar.id);
                    }}
                    onClose={() => {
                        setDialogDeletar(null);
                        void afterSave(false);
                    }}
                />
            )}
        </main>
    );
}
