import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { parlamentaresApi } from '../../api/legislative/parlamentares.api';
import {
    mesaDiretoraApi,
    type BoardMember,
    type BoardRole,
} from '../../api/legislative/mesa-diretora.api';
import { useAppToast } from '../../hooks/useAppToast';
import { Modal } from '../Modal';
import { usePermissions } from '../../hooks/usePermissions';
import {
    compareBoardRoles,
    formatMesaPartyLabel,
    parlamentarInitials,
} from '../../utils/mesaMemberDisplay';

type Props = {
    boardId: string;
    entityLabel: string;
    membros: BoardMember[];
    title?: string;
    onChanged: () => void;
};

export function MesaComposicaoTable({
    boardId,
    entityLabel,
    membros,
    title = 'Composição Atual',
    onChanged,
}: Props) {
    const { canWrite } = usePermissions();
    const { showApiError } = useAppToast();
    const [open, setOpen] = useState(false);
    const [parlamentares, setParlamentares] = useState<
        { id: string; parliamentaryName: string }[]
    >([]);
    const [cargos, setCargos] = useState<BoardRole[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [parliamentarianId, setParliamentarianId] = useState('');
    const [boardRoleId, setBoardRoleId] = useState('');

    const membrosOrdenados = useMemo(
        () =>
            [...membros].sort((a, b) =>
                compareBoardRoles(
                    a.boardRole.name,
                    b.boardRole.name,
                ),
            ),
        [membros],
    );

    const cargosOcupados = useMemo(
        () => new Set(membros.map((m) => m.boardRole.id).filter(Boolean)),
        [membros],
    );

    const parlamentaresNaMesa = useMemo(
        () => new Set(membros.map((m) => m.parliamentarian.id)),
        [membros],
    );

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        setLoadError(null);
        Promise.all([
            parlamentaresApi.list({ limit: 100 }),
            mesaDiretoraApi.listCargos(),
        ])
            .then(([parlRes, cargosRes]) => {
                const lista = parlRes.data
                    .filter((p) => !parlamentaresNaMesa.has(p.id))
                    .map((p) => ({
                        id: p.id,
                        parliamentaryName: p.parliamentaryName,
                    }));
                setParlamentares(lista);
                setParliamentarianId(lista[0]?.id ?? '');
                setCargos(cargosRes);
                const primeiroCargoLivre =
                    cargosRes.find((c) => !cargosOcupados.has(c.id))?.id ?? '';
                setBoardRoleId(primeiroCargoLivre);
            })
            .catch((err: unknown) => {
                setLoadError(
                    err instanceof Error
                        ? err.message
                        : 'Não foi possível carregar dados.',
                );
            })
            .finally(() => setLoading(false));
    }, [open, membros, cargosOcupados, parlamentaresNaMesa]);

    const cargoSelecionadoOcupado = boardRoleId
        ? cargosOcupados.has(boardRoleId)
        : false;

    const podeSalvar =
        !loading &&
        !submitting &&
        Boolean(parliamentarianId) &&
        Boolean(boardRoleId) &&
        !cargoSelecionadoOcupado;

    async function handleAdd(e: FormEvent) {
        e.preventDefault();
        if (!podeSalvar) return;
        setSubmitting(true);
        try {
            await mesaDiretoraApi.addMembro(boardId, {
                parliamentarianId,
                boardRoleId,
            });
            setOpen(false);
            onChanged();
        } catch (err) {
            showApiError(err);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleRemove(membro: BoardMember) {
        const nome =
            membro.parliamentarian.parliamentaryName ?? 'este parlamentar';
        if (!confirm(`Remover ${nome} da ${entityLabel}?`)) return;
        try {
            await mesaDiretoraApi.removeMembro(boardId, membro.id);
            onChanged();
        } catch (err) {
            showApiError(err);
        }
    }

    return (
        <div className="mesa-composicao">
            <div className="mesa-composicao__header">
                <div>
                    <h3 className="mesa-composicao__title">{title}</h3>
                    <p className="mesa-composicao__subtitle">
                        {membros.length} membro(s) na mesa
                    </p>
                </div>
                {canWrite && (
                    <Button
                        type="button"
                        label="Adicionar membro"
                        icon="pi pi-plus"
                        size="small"
                        onClick={() => setOpen(true)}
                    />
                )}
            </div>

            {membrosOrdenados.length === 0 ? (
                <p className="mesa-composicao__empty">
                    Nenhum membro na composição. Adicione parlamentares e cargos.
                </p>
            ) : (
                <div className="mesa-composicao__table-wrap">
                    <table className="mesa-composicao__table">
                        <thead>
                            <tr>
                                <th>Parlamentar</th>
                                <th>Cargo</th>
                                {canWrite && <th>Ação</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {membrosOrdenados.map((membro) => {
                                const nome =
                                    membro.parliamentarian.parliamentaryName?.trim() ||
                                    '—';
                                const partyLabel = formatMesaPartyLabel(
                                    membro.parliamentarian.politicalParty,
                                );
                                const initials = parlamentarInitials(nome);
                                const photoUrl =
                                    membro.parliamentarian.photoUrl?.trim() ||
                                    null;

                                return (
                                    <tr key={membro.id}>
                                        <td>
                                            <div className="mesa-composicao__parlamentar">
                                                <div
                                                    className="mesa-composicao__avatar"
                                                    aria-hidden
                                                >
                                                    {photoUrl ? (
                                                        <Avatar
                                                            image={photoUrl}
                                                            shape="circle"
                                                        />
                                                    ) : (
                                                        <Avatar
                                                            label={initials}
                                                            shape="circle"
                                                        />
                                                    )}
                                                </div>
                                                <div className="mesa-composicao__identity">
                                                    <strong>{nome}</strong>
                                                    {partyLabel ? (
                                                        <span className="mesa-composicao__party">
                                                            {partyLabel}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="mesa-composicao__cargo">
                                            {membro.boardRole.name}
                                        </td>
                                        {canWrite && (
                                            <td className="mesa-composicao__acao">
                                                <Button
                                                    type="button"
                                                    icon="pi pi-trash"
                                                    rounded
                                                    text
                                                    size="small"
                                                    severity="danger"
                                                    aria-label={`Remover ${nome}`}
                                                    onClick={() =>
                                                        void handleRemove(membro)
                                                    }
                                                />
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
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
                                            : 'Nenhum parlamentar disponível'}
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
                        {!loading && parlamentares.length === 0 ? (
                            <p className="alert alert-warn">
                                Todos os parlamentares já integram esta composição.
                            </p>
                        ) : null}
                        {!loading &&
                        cargos.length > 0 &&
                        cargos.every((c) => cargosOcupados.has(c.id)) ? (
                            <p className="alert alert-warn">
                                Todos os cargos da mesa já estão ocupados.
                            </p>
                        ) : null}
                        <label className="mt-3">
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
                                disabled={!podeSalvar}
                            >
                                {submitting ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
