import { FormEvent, useEffect, useState } from 'react';
import { MODULE_ICONS } from '../app/navigation';
import {
    frentesApi,
    type ParliamentaryFront,
} from '../api/legislative/frentes.api';
import { Modal } from '../components/Modal';
import { PanelToolbar } from '../components/PanelToolbar';
import { usePermissions } from '../hooks/usePermissions';

function formatDate(iso?: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR');
}

const STATUS_LABEL: Record<string, string> = {
    ACTIVE: 'Ativa',
    INACTIVE: 'Inativa',
    FINISHED: 'Encerrada',
};

export function FrentesPage() {
    const { canWrite } = usePermissions();
    const [items, setItems] = useState<ParliamentaryFront[]>([]);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [theme, setTheme] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    function load() {
        frentesApi.list({ limit: 100 }).then((r) => setItems(r.data));
    }

    useEffect(() => {
        load();
    }, []);

    async function handleCreate(e: FormEvent) {
        e.preventDefault();
        await frentesApi.create({
            name: name.trim(),
            theme: theme.trim(),
            description: description.trim() || undefined,
            startDate: startDate
                ? new Date(startDate).toISOString()
                : undefined,
            endDate: endDate ? new Date(endDate).toISOString() : undefined,
        });
        setOpen(false);
        setName('');
        setTheme('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        load();
    }

    return (
        <div className="page">
            <PanelToolbar
                icon={MODULE_ICONS.frentes}
                title="Frentes parlamentares"
                actions={
                    canWrite ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setOpen(true)}
                        >
                            Adicionar frente
                        </button>
                    ) : undefined
                }
            />
            <div className="card table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Tema</th>
                            <th>Início</th>
                            <th>Fim</th>
                            <th>Situação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((f) => (
                            <tr key={f.id}>
                                <td>{f.name}</td>
                                <td>{f.theme}</td>
                                <td>{formatDate(f.startDate)}</td>
                                <td>{formatDate(f.endDate)}</td>
                                <td>
                                    {STATUS_LABEL[f.status] ?? f.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {open && (
                <Modal title="Nova frente" onClose={() => setOpen(false)}>
                    <form onSubmit={handleCreate} className="form-stack">
                        <label>
                            Nome *
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </label>
                        <label>
                            Tema *
                            <input
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                required
                            />
                        </label>
                        <label>
                            Descrição
                            <textarea
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                                rows={3}
                            />
                        </label>
                        <div className="form-grid-2">
                            <label>
                                Data de início
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                />
                            </label>
                            <label>
                                Data de fim
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </label>
                        </div>
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
