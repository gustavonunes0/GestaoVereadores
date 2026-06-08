import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../app/navigation';
import { MODULE_ICONS } from '../app/navigation';
import { api, apiList } from '../api/client';
import { ColegiadoMembersPanel } from '../components/camara/ColegiadoMembersPanel';
import { NavDrawer } from '../components/NavDrawer';
import { Modal } from '../components/Modal';
import { PanelToolbar } from '../components/PanelToolbar';
import { useLegislatura } from '../contexts/LegislaturaContext';
import { usePermissions } from '../hooks/usePermissions';

type MesaResumo = {
    id: string;
    legislaturaId?: string;
    legislatura?: { id?: string; numero: number };
    sessao?: { dataInicio?: string };
    membros?: { id: string; cargo?: { id: string; nome: string } }[];
};

type MesaDetalhe = {
    id: string;
    legislatura?: { numero: number };
    sessao?: { id: string; dataInicio?: string };
    mensagem?: string;
    membros: {
        id: string;
        parlamentar?: { pessoa?: { nome: string } };
        cargo?: { nome: string };
    }[];
};

export function MesaDiretoraPage() {
    const { canWrite } = usePermissions();
    const { legislaturaId, legislaturaAtiva } = useLegislatura();
    const [items, setItems] = useState<MesaResumo[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [detail, setDetail] = useState<MesaDetalhe | null>(null);
    const [open, setOpen] = useState(false);

    const filtered = useMemo(
        () =>
            legislaturaId
                ? items.filter(
                      (m) =>
                          m.legislaturaId === legislaturaId ||
                          m.legislatura?.id === legislaturaId,
                  )
                : items,
        [items, legislaturaId],
    );

    const load = useCallback(() => {
        return apiList<MesaResumo>('/mesa-diretora', { limit: 100 }).then(
            (r) => {
                setItems(r.data);
                if (selectedId && !r.data.some((m) => m.id === selectedId)) {
                    setSelectedId(null);
                    setDetail(null);
                }
            },
        );
    }, [selectedId]);

    useEffect(() => {
        load();
    }, [load, legislaturaId]);

    useEffect(() => {
        if (!selectedId) {
            setDetail(null);
            return;
        }
        api<MesaDetalhe>(`/mesa-diretora/${selectedId}`).then(setDetail);
    }, [selectedId]);

    async function handleCreate(e: FormEvent) {
        e.preventDefault();
        if (!legislaturaId) return;
        await api('/mesa-diretora', {
            method: 'POST',
            body: JSON.stringify({ legislaturaId }),
        });
        setOpen(false);
        await load();
    }

    function closeDrawer() {
        setSelectedId(null);
        setDetail(null);
    }

    function refreshDetail() {
        if (!selectedId) return;
        api<MesaDetalhe>(`/mesa-diretora/${selectedId}`).then(setDetail);
        load();
    }

    return (
        <>
            <PanelToolbar
                icon={MODULE_ICONS.mesaDiretora}
                title="Mesa diretora"
                actions={
                    canWrite ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setOpen(true)}
                            disabled={!legislaturaId}
                        >
                            Nova composição
                        </button>
                    ) : undefined
                }
            />

            {!legislaturaId && (
                <p className="alert alert-warn">
                    Selecione a legislatura na barra superior ou cadastre em{' '}
                    <Link to={ROUTES.camara.legislaturas}>Legislaturas</Link>.
                </p>
            )}

            <div className="list-panel">
                <div className="list-panel__body">
                    <div className="list-panel__scroll table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Legislatura</th>
                                    <th>Cargos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((m) => (
                                    <tr
                                        key={m.id}
                                        className={
                                            selectedId === m.id
                                                ? 'row-selected'
                                                : ''
                                        }
                                        onClick={() => setSelectedId(m.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td>{m.legislatura?.numero ?? '—'}ª</td>
                                        <td>{m.membros?.length ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filtered.length === 0 && (
                        <p className="table-empty-state">
                            Nenhuma mesa para esta legislatura. Clique em
                            &quot;Nova composição&quot;.
                        </p>
                    )}
                </div>
            </div>

            <NavDrawer
                visible={!!detail}
                onHide={closeDrawer}
                wide
                title={`Mesa — ${detail?.legislatura?.numero ?? '—'}ª legislatura`}
            >
                {detail && (
                    <>
                        {detail.mensagem && (
                            <p className="muted" style={{ fontSize: '0.9rem' }}>
                                {detail.mensagem}
                            </p>
                        )}
                        <h3 className="detail-subtitle">Composição da mesa</h3>
                        <ColegiadoMembersPanel
                            entityLabel="mesa diretora"
                            membros={detail.membros}
                            addMembroUrl={`/mesa-diretora/${detail.id}/membros`}
                            removeMembroUrl={(membroId) =>
                                `/mesa-diretora/${detail.id}/membros/${membroId}`
                            }
                            onChanged={refreshDetail}
                            requireCargo
                        />
                        <p
                            className="muted"
                            style={{ fontSize: '0.85rem', marginTop: '1rem' }}
                        >
                            Depois da mesa definida, cadastre{' '}
                            <Link to={ROUTES.camara.autores}>autores</Link> e
                            inicie <Link to={ROUTES.materias}>matérias</Link>.
                        </p>
                    </>
                )}
            </NavDrawer>

            {open && (
                <Modal
                    title="Nova mesa diretora"
                    onClose={() => setOpen(false)}
                >
                    <form onSubmit={handleCreate}>
                        <p className="muted" style={{ fontSize: '0.9rem' }}>
                            Será criada para a legislatura{' '}
                            <strong>{legislaturaAtiva?.numero ?? '—'}ª</strong>{' '}
                            (contexto atual).
                        </p>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setOpen(false)}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Criar e compor membros
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}
