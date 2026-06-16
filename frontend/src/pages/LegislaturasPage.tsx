import { FormEvent, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { MODULE_ICONS } from '../app/navigation';
import {
    legislaturasApi,
    type Legislature,
} from '../api/legislative/legislaturas.api';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { usePermissions } from '../hooks/usePermissions';
import { useLegislatura } from '../contexts/LegislaturaContext';

export function LegislaturasPage() {
    const { canWrite } = usePermissions();
    const { refresh } = useLegislatura();
    const [items, setItems] = useState<Legislature[]>([]);
    const [open, setOpen] = useState(false);
    const [number, setNumber] = useState('20');
    const [startDate, setStartDate] = useState('2025-01-01');
    const [isCurrent, setIsCurrent] = useState(true);

    function load() {
        legislaturasApi.list({ limit: 50 }).then((r) => setItems(r.data));
    }

    useEffect(() => {
        load();
    }, []);

    async function handleCreate(e: FormEvent) {
        e.preventDefault();
        await legislaturasApi.create({
            number: Number(number),
            startDate: new Date(startDate).toISOString(),
            isCurrent,
        });
        setOpen(false);
        await refresh();
        load();
    }

    return (
        <div className="page">
            <PageHeader
                icon={MODULE_ICONS.legislaturas}
                title="Legislaturas"
                subtitle="Períodos legislativos e legislatura vigente da câmara."
                actions={
                    canWrite ? (
                        <Button
                            label="Nova legislatura"
                            icon="pi pi-plus"
                            onClick={() => setOpen(true)}
                        />
                    ) : undefined
                }
            />
            <div className="card table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Número</th>
                            <th>Início</th>
                            <th>Fim</th>
                            <th>Atual</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((l) => (
                            <tr key={l.id}>
                                <td>{l.number}ª</td>
                                <td>
                                    {new Date(l.startDate).toLocaleDateString(
                                        'pt-BR',
                                    )}
                                </td>
                                <td>
                                    {l.endDate
                                        ? new Date(l.endDate).toLocaleDateString(
                                              'pt-BR',
                                          )
                                        : '—'}
                                </td>
                                <td>{l.isCurrent ? 'Sim' : 'Não'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {open && (
                <Modal title="Nova legislatura" onClose={() => setOpen(false)}>
                    <form onSubmit={handleCreate}>
                        <div className="form-grid">
                            <label>
                                Número *
                                <input
                                    type="number"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                Data início *
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    required
                                />
                            </label>
                        </div>
                        <label
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginTop: '0.75rem',
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={isCurrent}
                                onChange={(e) => setIsCurrent(e.target.checked)}
                            />
                            Legislatura em exercício
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
                                Salvar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
