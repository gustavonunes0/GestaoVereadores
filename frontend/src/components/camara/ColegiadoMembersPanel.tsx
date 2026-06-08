import { FormEvent, useEffect, useState } from 'react';
import { api, apiList } from '../../api/client';
import { Modal } from '../Modal';
import { useDominios } from '../../hooks/useDominios';
import { usePermissions } from '../../hooks/usePermissions';

export type MembroLinha = {
    id: string;
    parlamentar?: { id?: string; pessoa?: { nome: string } };
    cargo?: { id?: string; nome: string };
    titular?: boolean;
};

type ParlamentarOption = {
    id: string;
    pessoa: { nome: string };
};

type Props = {
    entityLabel: string;
    membros: MembroLinha[];
    addMembroUrl: string;
    removeMembroUrl: (membroId: string) => string;
    onChanged: () => void;
    /** Comissões: titular/suplente */
    showTitular?: boolean;
    /** Mesa: cargo obrigatório via domínios */
    requireCargo?: boolean;
};

export function ColegiadoMembersPanel({
    entityLabel,
    membros,
    addMembroUrl,
    removeMembroUrl,
    onChanged,
    showTitular = false,
    requireCargo = false,
}: Props) {
    const { canWrite } = usePermissions();
    const { dominios } = useDominios();
    const [open, setOpen] = useState(false);
    const [parlamentares, setParlamentares] = useState<ParlamentarOption[]>([]);
    const [loadingParlamentares, setLoadingParlamentares] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [parlamentarId, setParlamentarId] = useState('');
    const [cargoId, setCargoId] = useState('');
    const [titular, setTitular] = useState(true);

    useEffect(() => {
        if (!open) return;
        setLoadingParlamentares(true);
        setLoadError(null);
        apiList<ParlamentarOption>('/parlamentares', { limit: 100 })
            .then((r) => {
                const lista = r.data ?? [];
                setParlamentares(lista);
                setParlamentarId(lista[0]?.id ?? '');
            })
            .catch((err: unknown) => {
                setParlamentares([]);
                setParlamentarId('');
                setLoadError(
                    err instanceof Error
                        ? err.message
                        : 'Não foi possível carregar parlamentares.',
                );
            })
            .finally(() => setLoadingParlamentares(false));
        if (requireCargo && dominios?.cargosMesa[0]) {
            setCargoId(dominios.cargosMesa[0].id);
        }
    }, [open, requireCargo, dominios]);

    async function handleAdd(e: FormEvent) {
        e.preventDefault();
        const body: Record<string, unknown> = { parlamentarId };
        if (requireCargo) body.cargoId = cargoId;
        if (showTitular) body.titular = titular;
        await api(addMembroUrl, { method: 'POST', body: JSON.stringify(body) });
        setOpen(false);
        onChanged();
    }

    async function handleRemove(membro: MembroLinha) {
        const nome = membro.parlamentar?.pessoa?.nome ?? 'este parlamentar';
        if (!confirm(`Remover ${nome} da ${entityLabel}?`)) return;
        await api(removeMembroUrl(membro.id), { method: 'DELETE' });
        onChanged();
    }

    const cargosOcupados = new Set(
        membros.map((m) => m.cargo?.id).filter(Boolean) as string[],
    );

    return (
        <>
            <div className="detail-actions">
                {canWrite && (
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setOpen(true)}
                    >
                        Adicionar membro
                    </button>
                )}
            </div>

            {membros.length === 0 ? (
                <p className="muted">
                    Nenhum membro na composição. Adicione parlamentares e
                    cargos.
                </p>
            ) : (
                <ul className="membros-mesa-list">
                    {membros.map((m) => (
                        <li key={m.id} className="membro-mesa-item">
                            <div>
                                <strong>{m.cargo?.nome ?? 'Membro'}</strong>
                                <span>
                                    {m.parlamentar?.pessoa?.nome ?? '—'}
                                </span>
                                {showTitular && (
                                    <span
                                        className="badge badge-muted"
                                        style={{ marginLeft: '0.35rem' }}
                                    >
                                        {m.titular !== false
                                            ? 'Titular'
                                            : 'Suplente'}
                                    </span>
                                )}
                            </div>
                            {canWrite && (
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleRemove(m)}
                                >
                                    Remover
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {open && (
                <Modal
                    title={`Adicionar membro — ${entityLabel}`}
                    onClose={() => setOpen(false)}
                >
                    <form onSubmit={handleAdd}>
                        <label>
                            Parlamentar *
                            <select
                                value={parlamentarId}
                                onChange={(e) =>
                                    setParlamentarId(e.target.value)
                                }
                                required
                                disabled={
                                    loadingParlamentares ||
                                    parlamentares.length === 0
                                }
                            >
                                {parlamentares.length === 0 ? (
                                    <option value="">
                                        {loadingParlamentares
                                            ? 'Carregando...'
                                            : 'Nenhum parlamentar cadastrado'}
                                    </option>
                                ) : (
                                    parlamentares.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.pessoa?.nome ?? 'Sem nome'}
                                        </option>
                                    ))
                                )}
                            </select>
                        </label>
                        {loadError && (
                            <p
                                className="alert alert-warn"
                                style={{ marginTop: '0.5rem' }}
                            >
                                {loadError}
                            </p>
                        )}
                        {!loadError &&
                            !loadingParlamentares &&
                            parlamentares.length === 0 && (
                                <p
                                    className="muted"
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    Cadastre vereadores em Estrutura da Câmara →
                                    Parlamentares.
                                </p>
                            )}
                        {requireCargo && dominios && (
                            <label>
                                Cargo na mesa *
                                <select
                                    value={cargoId}
                                    onChange={(e) => setCargoId(e.target.value)}
                                    required
                                >
                                    {dominios.cargosMesa.map((c) => (
                                        <option
                                            key={c.id}
                                            value={c.id}
                                            disabled={cargosOcupados.has(c.id)}
                                        >
                                            {c.nome}
                                            {cargosOcupados.has(c.id)
                                                ? ' (ocupado)'
                                                : ''}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
                        {showTitular && (
                            <label
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={titular}
                                    onChange={(e) =>
                                        setTitular(e.target.checked)
                                    }
                                />
                                Titular
                            </label>
                        )}
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setOpen(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={
                                    loadingParlamentares ||
                                    parlamentares.length === 0 ||
                                    (requireCargo && !cargoId)
                                }
                            >
                                Salvar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}
