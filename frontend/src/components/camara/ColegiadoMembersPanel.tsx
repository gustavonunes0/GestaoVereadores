import { FormEvent, useEffect, useState } from 'react';
import { parlamentaresApi } from '../../api/legislative/parlamentares.api';
import { mesaDiretoraApi, type BoardRole } from '../../api/legislative/mesa-diretora.api';
import { Modal } from '../Modal';
import { usePermissions } from '../../hooks/usePermissions';

export type MembroLinha = {
    id: string;
    parliamentarian?: {
        id?: string;
        parliamentaryName?: string;
    };
    boardRole?: { id?: string; name: string };
};

type Props = {
    entityLabel: string;
    membros: MembroLinha[];
    boardId: string;
    onChanged: () => void;
};

export function ColegiadoMembersPanel({
    entityLabel,
    membros,
    boardId,
    onChanged,
}: Props) {
    const { canWrite } = usePermissions();
    const [open, setOpen] = useState(false);
    const [parlamentares, setParlamentares] = useState<
        { id: string; parliamentaryName: string }[]
    >([]);
    const [cargos, setCargos] = useState<BoardRole[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [parliamentarianId, setParliamentarianId] = useState('');
    const [boardRoleId, setBoardRoleId] = useState('');

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        setLoadError(null);
        Promise.all([
            parlamentaresApi.list({ limit: 100 }),
            mesaDiretoraApi.listCargos(),
        ])
            .then(([parlRes, cargosRes]) => {
                const lista = parlRes.data.map((p) => ({
                    id: p.id,
                    parliamentaryName: p.parliamentaryName,
                }));
                setParlamentares(lista);
                setParliamentarianId(lista[0]?.id ?? '');
                setCargos(cargosRes);
                setBoardRoleId(cargosRes[0]?.id ?? '');
            })
            .catch((err: unknown) => {
                setLoadError(
                    err instanceof Error
                        ? err.message
                        : 'Não foi possível carregar dados.',
                );
            })
            .finally(() => setLoading(false));
    }, [open]);

    async function handleAdd(e: FormEvent) {
        e.preventDefault();
        await mesaDiretoraApi.addMembro(boardId, {
            parliamentarianId,
            boardRoleId,
        });
        setOpen(false);
        onChanged();
    }

    async function handleRemove(membro: MembroLinha) {
        const nome =
            membro.parliamentarian?.parliamentaryName ?? 'este parlamentar';
        if (!confirm(`Remover ${nome} da ${entityLabel}?`)) return;
        await mesaDiretoraApi.removeMembro(boardId, membro.id);
        onChanged();
    }

    const cargosOcupados = new Set(
        membros.map((m) => m.boardRole?.id).filter(Boolean) as string[],
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
                    Nenhum membro na composição. Adicione parlamentares e cargos.
                </p>
            ) : (
                <ul className="membros-mesa-list">
                    {membros.map((m) => (
                        <li key={m.id} className="membro-mesa-item">
                            <div>
                                <strong>{m.boardRole?.name ?? 'Membro'}</strong>
                                <span>
                                    {m.parliamentarian?.parliamentaryName ?? '—'}
                                </span>
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
                                value={parliamentarianId}
                                onChange={(e) =>
                                    setParliamentarianId(e.target.value)
                                }
                                required
                                disabled={loading || parlamentares.length === 0}
                            >
                                {parlamentares.length === 0 ? (
                                    <option value="">
                                        {loading
                                            ? 'Carregando...'
                                            : 'Nenhum parlamentar'}
                                    </option>
                                ) : (
                                    parlamentares.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.parliamentaryName}
                                        </option>
                                    ))
                                )}
                            </select>
                        </label>
                        {loadError && (
                            <p className="alert alert-warn">{loadError}</p>
                        )}
                        <label>
                            Cargo na mesa *
                            <select
                                value={boardRoleId}
                                onChange={(e) => setBoardRoleId(e.target.value)}
                                required
                                disabled={loading || cargos.length === 0}
                            >
                                {cargos.map((c) => (
                                    <option
                                        key={c.id}
                                        value={c.id}
                                        disabled={cargosOcupados.has(c.id)}
                                    >
                                        {c.name}
                                        {cargosOcupados.has(c.id)
                                            ? ' (ocupado)'
                                            : ''}
                                    </option>
                                ))}
                            </select>
                        </label>
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
                                    loading ||
                                    !parliamentarianId ||
                                    !boardRoleId
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
