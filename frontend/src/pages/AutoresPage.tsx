import { FormEvent, useEffect, useState } from 'react';
import { MODULE_ICONS } from '../app/navigation';
import { guestUsersApi, type GuestUser } from '../api/guest-users.api';
import { Modal } from '../components/Modal';
import { PanelToolbar } from '../components/PanelToolbar';
import { usePermissions } from '../hooks/usePermissions';

export function AutoresPage() {
    const { canWrite } = usePermissions();
    const [items, setItems] = useState<GuestUser[]>([]);
    const [open, setOpen] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [organizationName, setOrganizationName] = useState('');

    function load() {
        guestUsersApi.list({ limit: 100 }).then((r) => setItems(r.data));
    }

    useEffect(() => {
        load();
    }, []);

    async function handleCreate(e: FormEvent) {
        e.preventDefault();
        await guestUsersApi.create({
            fullName: fullName.trim(),
            email: email.trim() || undefined,
            organizationName: organizationName.trim() || undefined,
        });
        setOpen(false);
        setFullName('');
        setEmail('');
        setOrganizationName('');
        load();
    }

    async function remove(id: string) {
        if (!confirm('Excluir autor convidado?')) return;
        await guestUsersApi.remove(id);
        load();
    }

    return (
        <div className="page">
            <PanelToolbar
                icon={MODULE_ICONS.autores}
                title="Autores convidados"
                actions={
                    canWrite ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setOpen(true)}
                        >
                            Novo autor
                        </button>
                    ) : undefined
                }
            />
            <p className="muted" style={{ margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
                Pessoas externas à casa que podem ser vinculadas como autores em
                matérias (API <code>guest-users</code>).
            </p>
            <div className="card table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>E-mail</th>
                            <th>Organização</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((a) => (
                            <tr key={a.id}>
                                <td>{a.fullName}</td>
                                <td>{a.email ?? '—'}</td>
                                <td>{a.organizationName ?? '—'}</td>
                                <td>
                                    {canWrite && (
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => remove(a.id)}
                                        >
                                            Excluir
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {open && (
                <Modal title="Novo autor convidado" onClose={() => setOpen(false)}>
                    <form onSubmit={handleCreate}>
                        <label>
                            Nome completo *
                            <input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </label>
                        <label>
                            E-mail
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </label>
                        <label>
                            Organização
                            <input
                                value={organizationName}
                                onChange={(e) =>
                                    setOrganizationName(e.target.value)
                                }
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
                                Salvar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
