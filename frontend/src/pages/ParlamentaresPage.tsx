import { FormEvent, useCallback, useEffect, useState } from 'react';
import { MODULE_ICONS } from '../app/navigation';
import {
    parlamentaresApi,
    type Parliamentarian,
    type CreateParliamentarianInput,
} from '../api/legislative/parlamentares.api';
import { apiList } from '../api/client';
import { API_PATHS } from '../api/paths';
import { NavDrawer } from '../components/NavDrawer';
import { EmptyState } from '../components/common/EmptyState';
import { PanelToolbar } from '../components/PanelToolbar';
import { useAppToast } from '../hooks/useAppToast';
import { usePermissions } from '../hooks/usePermissions';

type PoliticalParty = { id: string; name: string; acronym: string };

type FormState = {
    tenantUserId: string;
    parliamentaryName: string;
    politicalPartyId: string;
    officeNumber: string;
    biography: string;
};

const emptyForm = (): FormState => ({
    tenantUserId: '',
    parliamentaryName: '',
    politicalPartyId: '',
    officeNumber: '',
    biography: '',
});

const STATUS_LABEL: Record<string, string> = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
};

export function ParlamentaresPage() {
    const { canWrite } = usePermissions();
    const { showApiError, showSuccess } = useAppToast();
    const [items, setItems] = useState<Parliamentarian[]>([]);
    const [partidos, setPartidos] = useState<PoliticalParty[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = useCallback(() => {
        return parlamentaresApi.list({ limit: 100 }).then((r) => {
            setItems(r.data);
            if (selectedId && !r.data.some((p) => p.id === selectedId)) {
                setSelectedId(null);
                setCreating(false);
            }
        });
    }, [selectedId]);

    useEffect(() => {
        load();
        apiList<PoliticalParty>(API_PATHS.legislative.partidos, { limit: 50 })
            .then((r) => setPartidos(r.data))
            .catch(() => setPartidos([]));
    }, [load]);

    useEffect(() => {
        if (creating || !selectedId) return;
        parlamentaresApi.getById(selectedId).then((p) => {
            setForm({
                tenantUserId: p.tenantUserId,
                parliamentaryName: p.parliamentaryName,
                politicalPartyId: p.politicalParty?.id ?? '',
                officeNumber: p.officeNumber ?? '',
                biography: p.biography ?? '',
            });
        });
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
            const body: CreateParliamentarianInput = {
                tenantUserId: form.tenantUserId.trim(),
                parliamentaryName: form.parliamentaryName.trim(),
                politicalPartyId: form.politicalPartyId || undefined,
                officeNumber: form.officeNumber.trim() || undefined,
                biography: form.biography.trim() || undefined,
            };
            if (creating) {
                const created = await parlamentaresApi.create(body);
                setCreating(false);
                setSelectedId(created.id);
                showSuccess('Parlamentar cadastrado.');
            } else if (selectedId) {
                await parlamentaresApi.update(selectedId, {
                    parliamentaryName: body.parliamentaryName,
                    politicalPartyId: body.politicalPartyId,
                    officeNumber: body.officeNumber,
                    biography: body.biography,
                });
                showSuccess('Parlamentar atualizado.');
            }
            await load();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    async function remove(id: string) {
        if (!confirm('Excluir parlamentar?')) return;
        try {
            await parlamentaresApi.remove(id);
            if (selectedId === id) closeDrawer();
            await load();
            showSuccess('Parlamentar removido.');
        } catch (err) {
            showApiError(err);
        }
    }

    const editing = creating || !!selectedId;

    return (
        <div className="page">
            <PanelToolbar
                icon={MODULE_ICONS.parlamentares}
                title="Parlamentares"
                actions={
                    canWrite ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={startCreate}
                        >
                            Adicionar parlamentar
                        </button>
                    ) : undefined
                }
            />

            <p className="muted" style={{ margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
                Cadastro vinculado a usuário do tenant (
                <code>tenantUserId</code>). O usuário deve existir em Identidade
                com perfil parlamentar.
            </p>

            <div className="split-view">
                <div className="split-panel split-list">
                    <div className="split-panel__body">
                        <div className="split-panel__scroll table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nome parlamentar</th>
                                        <th>Usuário</th>
                                        <th>Partido</th>
                                        <th>Situação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((p) => (
                                        <tr
                                            key={p.id}
                                            className={
                                                selectedId === p.id
                                                    ? 'row-selected'
                                                    : ''
                                            }
                                            onClick={() => {
                                                setCreating(false);
                                                setSelectedId(p.id);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td>{p.parliamentaryName}</td>
                                            <td>
                                                {p.user.firstName}{' '}
                                                {p.user.lastName}
                                            </td>
                                            <td>
                                                {p.politicalParty?.acronym ??
                                                    '—'}
                                            </td>
                                            <td>
                                                {STATUS_LABEL[p.status] ??
                                                    p.status}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {items.length === 0 && (
                            <EmptyState
                                icon="pi pi-users"
                                title="Nenhum parlamentar"
                                hint="Cadastre o primeiro vereador da casa."
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
                            ? 'Novo parlamentar'
                            : form.parliamentaryName || 'Parlamentar'
                    }
                >
                    <form onSubmit={handleSubmit} className="form-stack">
                        {creating && (
                            <label>
                                ID do usuário do tenant *
                                <input
                                    value={form.tenantUserId}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            tenantUserId: e.target.value,
                                        }))
                                    }
                                    placeholder="UUID do TenantUser"
                                    required
                                />
                            </label>
                        )}
                        <label>
                            Nome parlamentar *
                            <input
                                value={form.parliamentaryName}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        parliamentaryName: e.target.value,
                                    }))
                                }
                                required
                            />
                        </label>
                        <label>
                            Partido
                            <select
                                value={form.politicalPartyId}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        politicalPartyId: e.target.value,
                                    }))
                                }
                            >
                                <option value="">—</option>
                                {partidos.map((pt) => (
                                    <option key={pt.id} value={pt.id}>
                                        {pt.acronym} — {pt.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Gabinete / sala
                            <input
                                value={form.officeNumber}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        officeNumber: e.target.value,
                                    }))
                                }
                            />
                        </label>
                        <label>
                            Biografia
                            <textarea
                                value={form.biography}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        biography: e.target.value,
                                    }))
                                }
                                rows={4}
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
        </div>
    );
}
