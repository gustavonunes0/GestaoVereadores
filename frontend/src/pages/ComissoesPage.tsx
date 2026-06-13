import { FormEvent, useCallback, useEffect, useState } from 'react';
import { MODULE_ICONS } from '../app/navigation';
import {
    comissoesApi,
    type Committee,
    type CommitteeInput,
    type CommitteeStatus,
    type CommitteeType,
} from '../api/legislative/comissoes.api';
import { NavDrawer } from '../components/NavDrawer';
import { EmptyState } from '../components/common/EmptyState';
import { PanelToolbar } from '../components/PanelToolbar';
import { usePermissions } from '../hooks/usePermissions';

const TYPE_OPTIONS: { value: CommitteeType; label: string }[] = [
    { value: 'PERMANENT', label: 'Permanente' },
    { value: 'TEMPORARY', label: 'Temporária' },
];

const STATUS_OPTIONS: { value: CommitteeStatus; label: string }[] = [
    { value: 'ACTIVE', label: 'Ativa' },
    { value: 'INACTIVE', label: 'Inativa' },
    { value: 'FINISHED', label: 'Encerrada' },
];

type FormState = {
    name: string;
    acronym: string;
    type: CommitteeType;
    purpose: string;
    startDate: string;
    endDate: string;
    status: CommitteeStatus;
    notes: string;
};

const emptyForm = (): FormState => ({
    name: '',
    acronym: '',
    type: 'PERMANENT',
    purpose: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
    notes: '',
});

function detailToForm(row: Committee): FormState {
    return {
        name: row.name,
        acronym: row.acronym ?? '',
        type: row.type,
        purpose: row.purpose,
        startDate: row.startDate?.slice(0, 10) ?? '',
        endDate: row.endDate?.slice(0, 10) ?? '',
        status: row.status,
        notes: row.notes ?? '',
    };
}

function buildPayload(form: FormState): CommitteeInput {
    const trim = (s: string) => s.trim() || undefined;
    const dateIso = (d: string) => (d ? new Date(d).toISOString() : undefined);
    return {
        name: form.name.trim(),
        acronym: trim(form.acronym),
        type: form.type,
        purpose: form.purpose.trim(),
        startDate: dateIso(form.startDate),
        endDate: dateIso(form.endDate),
        status: form.status,
        notes: trim(form.notes),
    };
}

export function ComissoesPage() {
    const { canWrite } = usePermissions();
    const [items, setItems] = useState<Committee[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = useCallback(() => {
        return comissoesApi.list({ limit: 100 }).then((r) => {
            setItems(r.data);
            if (selectedId && !r.data.some((c) => c.id === selectedId)) {
                setSelectedId(null);
                setCreating(false);
                setForm(emptyForm());
            }
        });
    }, [selectedId]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (creating) return;
        if (!selectedId) {
            setForm(emptyForm());
            return;
        }
        comissoesApi.getById(selectedId).then((d) => setForm(detailToForm(d)));
    }, [selectedId, creating]);

    function startCreate() {
        setSelectedId(null);
        setCreating(true);
        setForm(emptyForm());
    }

    function closeDrawer() {
        setSelectedId(null);
        setCreating(false);
        setForm(emptyForm());
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!canWrite) return;
        setSaving(true);
        try {
            const body = buildPayload(form);
            if (creating) {
                const created = await comissoesApi.create(body);
                setCreating(false);
                setSelectedId(created.id);
                await load();
            } else if (selectedId) {
                await comissoesApi.update(selectedId, body);
                await load();
            }
        } finally {
            setSaving(false);
        }
    }

    async function remove(id: string) {
        if (!confirm('Excluir comissão?')) return;
        await comissoesApi.remove(id);
        if (selectedId === id) closeDrawer();
        load();
    }

    const editing = creating || !!selectedId;

    return (
        <div className="page">
            <PanelToolbar
                icon={MODULE_ICONS.comissoes}
                title="Comissões"
                actions={
                    canWrite ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={startCreate}
                        >
                            Adicionar comissão
                        </button>
                    ) : undefined
                }
            />

            <div className="list-panel">
                <div className="list-panel__body">
                    <div className="list-panel__scroll table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Sigla</th>
                                    <th>Nome</th>
                                    <th>Tipo</th>
                                    <th>Situação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((c) => (
                                    <tr
                                        key={c.id}
                                        className={
                                            selectedId === c.id
                                                ? 'row-selected'
                                                : ''
                                        }
                                        onClick={() => {
                                            setCreating(false);
                                            setSelectedId(c.id);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td>{c.acronym ?? '—'}</td>
                                        <td>{c.name}</td>
                                        <td>
                                            {TYPE_OPTIONS.find(
                                                (t) => t.value === c.type,
                                            )?.label ?? c.type}
                                        </td>
                                        <td>
                                            {STATUS_OPTIONS.find(
                                                (s) => s.value === c.status,
                                            )?.label ?? c.status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {items.length === 0 && (
                        <EmptyState
                            icon="pi pi-briefcase"
                            title="Nenhuma comissão"
                            hint="Cadastre a primeira comissão da casa."
                        />
                    )}
                </div>
            </div>

            <NavDrawer
                    visible={editing}
                    onHide={closeDrawer}
                    wide
                    title={
                        creating
                            ? 'Nova comissão'
                            : form.name || 'Comissão'
                    }
                >
                    <form onSubmit={handleSubmit} className="form-stack">
                        <div className="form-grid-2">
                            <label>
                                Nome *
                                <input
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            name: e.target.value,
                                        }))
                                    }
                                    required
                                />
                            </label>
                            <label>
                                Sigla
                                <input
                                    value={form.acronym}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            acronym: e.target.value,
                                        }))
                                    }
                                />
                            </label>
                        </div>
                        <div className="form-grid-2">
                            <label>
                                Tipo *
                                <select
                                    value={form.type}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            type: e.target
                                                .value as CommitteeType,
                                        }))
                                    }
                                >
                                    {TYPE_OPTIONS.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Situação
                                <select
                                    value={form.status}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            status: e.target
                                                .value as CommitteeStatus,
                                        }))
                                    }
                                >
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <label>
                            Finalidade *
                            <textarea
                                value={form.purpose}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        purpose: e.target.value,
                                    }))
                                }
                                rows={3}
                                required
                            />
                        </label>
                        <div className="form-grid-2">
                            <label>
                                Início
                                <input
                                    type="date"
                                    value={form.startDate}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            startDate: e.target.value,
                                        }))
                                    }
                                />
                            </label>
                            <label>
                                Fim
                                <input
                                    type="date"
                                    value={form.endDate}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            endDate: e.target.value,
                                        }))
                                    }
                                />
                            </label>
                        </div>
                        <label>
                            Observações
                            <textarea
                                value={form.notes}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        notes: e.target.value,
                                    }))
                                }
                                rows={2}
                            />
                        </label>
                        <div className="modal-actions">
                            {!creating && selectedId && canWrite && (
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => remove(selectedId)}
                                >
                                    Excluir
                                </button>
                            )}
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={closeDrawer}
                            >
                                Fechar
                            </button>
                            {canWrite && (
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Salvando…' : 'Salvar'}
                                </button>
                            )}
                        </div>
                    </form>
            </NavDrawer>
        </div>
    );
}
