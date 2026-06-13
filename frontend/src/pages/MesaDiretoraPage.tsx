import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES, MODULE_ICONS } from '../app/navigation';
import {
    mesaDiretoraApi,
    type Board,
} from '../api/legislative/mesa-diretora.api';
import { ColegiadoMembersPanel } from '../components/camara/ColegiadoMembersPanel';
import { NavDrawer } from '../components/NavDrawer';
import { Modal } from '../components/Modal';
import { PanelToolbar } from '../components/PanelToolbar';
import { useLegislatura } from '../contexts/LegislaturaContext';
import { usePermissions } from '../hooks/usePermissions';

export function MesaDiretoraPage() {
    const { canWrite } = usePermissions();
    const { legislaturaId, legislaturaAtiva } = useLegislatura();
    const [items, setItems] = useState<Board[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [detail, setDetail] = useState<Board | null>(null);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');

    const filtered = useMemo(
        () =>
            legislaturaId
                ? items.filter((m) => m.legislatureId === legislaturaId)
                : items,
        [items, legislaturaId],
    );

    const load = useCallback(() => {
        return mesaDiretoraApi.list({ limit: 100 }).then((r) => {
            setItems(r.data);
            if (selectedId && !r.data.some((m) => m.id === selectedId)) {
                setSelectedId(null);
                setDetail(null);
            }
        });
    }, [selectedId]);

    useEffect(() => {
        load();
    }, [load, legislaturaId]);

    useEffect(() => {
        if (!selectedId) {
            setDetail(null);
            return;
        }
        mesaDiretoraApi.getById(selectedId).then(setDetail);
    }, [selectedId]);

    async function handleCreate(e: FormEvent) {
        e.preventDefault();
        if (!legislaturaId) return;
        const created = await mesaDiretoraApi.create({
            name: name.trim() || `Mesa Diretora ${legislaturaAtiva?.numero ?? ''}ª`,
            legislatureId: legislaturaId,
            startDate: new Date().toISOString(),
        });
        setOpen(false);
        setName('');
        await load();
        setSelectedId(created.id);
    }

    function closeDrawer() {
        setSelectedId(null);
        setDetail(null);
    }

    function refreshDetail() {
        if (!selectedId) return;
        mesaDiretoraApi.getById(selectedId).then(setDetail);
        load();
    }

    return (
        <div className="page">
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
                                    <th>Nome</th>
                                    <th>Legislatura</th>
                                    <th>Membros</th>
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
                                        <td>{m.name}</td>
                                        <td>
                                            {m.legislature?.number ??
                                                legislaturaAtiva?.numero ??
                                                '—'}
                                            ª
                                        </td>
                                        <td>{m.members?.length ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filtered.length === 0 && (
                        <p className="table-empty-state">
                            Nenhuma mesa para esta legislatura.
                        </p>
                    )}
                </div>
            </div>

            <NavDrawer
                visible={!!detail}
                onHide={closeDrawer}
                wide
                title={detail?.name ?? 'Mesa diretora'}
            >
                {detail && (
                    <>
                        <h3 className="detail-subtitle">Composição da mesa</h3>
                        <ColegiadoMembersPanel
                            entityLabel="mesa diretora"
                            membros={detail.members}
                            boardId={detail.id}
                            onChanged={refreshDetail}
                        />
                    </>
                )}
            </NavDrawer>

            {open && (
                <Modal
                    title="Nova mesa diretora"
                    onClose={() => setOpen(false)}
                >
                    <form onSubmit={handleCreate}>
                        <label>
                            Nome
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={`Mesa ${legislaturaAtiva?.numero ?? ''}ª legislatura`}
                            />
                        </label>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setOpen(false)}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Criar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
