import { FormEvent, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { MODULE_ICONS } from '../app/navigation';
import { api, apiList } from '../api/client';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
type TenantUserRole = 'ADMIN_STAFF' | 'STAFF';

type SiglRole = 'MASTER' | 'ADMIN' | 'OPERADOR';
type AnyRole = TenantUserRole | SiglRole | string;

type Usuario = {
    id: string;
    username: string;
    nome: string;
    role: AnyRole;
    ativo: boolean;
    createdAt?: string;
};

const SIGL_ROLES: SiglRole[] = ['MASTER', 'ADMIN', 'OPERADOR'];

const TENANT_ROLE_OPTIONS: { label: string; value: TenantUserRole }[] = [
    { label: 'Administrador (Admin Staff)', value: 'ADMIN_STAFF' },
    { label: 'Operador (Staff)', value: 'STAFF' },
];

const SIGL_ROLE_LABELS: Record<SiglRole, string> = {
    MASTER: 'Master',
    ADMIN: 'Administrador',
    OPERADOR: 'Operador',
};

const TENANT_ROLE_LABELS: Record<TenantUserRole, string> = {
    ADMIN_STAFF: 'Administrador',
    STAFF: 'Operador',
};

function getRoleLabel(role: AnyRole): string {
    if (role in TENANT_ROLE_LABELS) return TENANT_ROLE_LABELS[role as TenantUserRole];
    if (role in SIGL_ROLE_LABELS) return SIGL_ROLE_LABELS[role as SiglRole];
    return role;
}

export function UsuariosPage() {
    const [items, setItems] = useState<Usuario[]>([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
    const [createOpen, setCreateOpen] = useState(false);
    const [editUser, setEditUser] = useState<Usuario | null>(null);
    const [isTenantMode, setIsTenantMode] = useState(false);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [nome, setNome] = useState('');
    const [role, setRole] = useState<AnyRole>('OPERADOR');
    const [ativo, setAtivo] = useState(true);

    function load(page = 1) {
        apiList<Usuario>('/usuarios', { page, limit: 50 }).then((r) => {
            setItems(r.data);
            setMeta({ total: r.meta.total, page: r.meta.page, totalPages: r.meta.totalPages });
            const hasTenantRole = r.data.some(
                (u) => u.role === 'ADMIN_STAFF' || u.role === 'STAFF',
            );
            setIsTenantMode(hasTenantRole);
        });
    }

    useEffect(() => {
        load();
    }, []);

    function resetForm() {
        setUsername('');
        setPassword('');
        setNome('');
        setRole('OPERADOR');
        setAtivo(true);
    }

    function openEdit(u: Usuario) {
        setEditUser(u);
        setNome(u.nome);
        setRole(u.role);
        setAtivo(u.ativo);
    }

    async function handleCreate(e: FormEvent) {
        e.preventDefault();
        await api('/usuarios', {
            method: 'POST',
            body: JSON.stringify({ username, password, nome, role }),
        });
        setCreateOpen(false);
        resetForm();
        load();
    }

    async function handleUpdate(e: FormEvent) {
        e.preventDefault();
        if (!editUser) return;
        await api(`/usuarios/${editUser.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ nome, role, ativo }),
        });
        setEditUser(null);
        load(meta.page);
    }

    const roleOptions = isTenantMode
        ? TENANT_ROLE_OPTIONS
        : SIGL_ROLES.map((r) => ({ label: SIGL_ROLE_LABELS[r], value: r }));

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.usuarios}
                title="Usuários do sistema"
                actions={
                    <Button
                        label="Novo usuário"
                        icon="pi pi-plus"
                        onClick={() => { resetForm(); setCreateOpen(true); }}
                    />
                }
            />

            <p className="page-context">
                Apenas perfil Master / Administrador pode criar e alterar usuários.
            </p>

            <section aria-label="Lista de usuários">
            <div className="card table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Usuário</th>
                            <th>Nome</th>
                            <th>Perfil</th>
                            <th>Ativo</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((u) => (
                            <tr key={u.id}>
                                <td>{u.username}</td>
                                <td>{u.nome}</td>
                                <td>
                                    <span className="badge">{getRoleLabel(u.role)}</span>
                                </td>
                                <td>{u.ativo ? 'Sim' : 'Não'}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => openEdit(u)}
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {items.length === 0 && (
                    <p className="table-empty-state">Nenhum usuário cadastrado.</p>
                )}
            </div>

            {meta.totalPages > 1 && (
                <div className="toolbar sigl-cluster pagination-bar">
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={meta.page <= 1}
                        onClick={() => load(meta.page - 1)}
                    >
                        Anterior
                    </button>
                    <span className="text-muted">
                        Página {meta.page} de {meta.totalPages} ({meta.total} usuários)
                    </span>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={meta.page >= meta.totalPages}
                        onClick={() => load(meta.page + 1)}
                    >
                        Próxima
                    </button>
                </div>
            )}

            </section>

            {createOpen && (
                <Modal title="Novo usuário" onClose={() => setCreateOpen(false)}>
                    <form onSubmit={handleCreate}>
                        <div className="sigl-dialog-body">
                            <div className="sigl-dialog-secao">
                                <span className="sigl-dialog-secao-titulo">Acesso</span>
                                <div className="sigl-dialog-grid sigl-dialog-grid-2">
                                    <div className="sigl-filtro-campo">
                                        <label htmlFor="usr-login">Login *</label>
                                        <input
                                            id="usr-login"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            minLength={3}
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="sigl-filtro-campo">
                                        <label htmlFor="usr-senha">Senha *</label>
                                        <input
                                            id="usr-senha"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="sigl-dialog-secao">
                                <span className="sigl-dialog-secao-titulo">Perfil</span>
                                <div className="sigl-dialog-grid sigl-dialog-grid-2">
                                    <div className="sigl-filtro-campo">
                                        <label htmlFor="usr-nome">Nome exibido *</label>
                                        <input
                                            id="usr-nome"
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            required
                                            minLength={2}
                                        />
                                    </div>
                                    <div className="sigl-filtro-campo">
                                        <label htmlFor="usr-role">Perfil *</label>
                                        <select
                                            id="usr-role"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                        >
                                            {roleOptions.map((r) => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setCreateOpen(false)}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">Criar</button>
                        </div>
                    </form>
                </Modal>
            )}

            {editUser && (
                <Modal title={`Editar — ${editUser.username}`} onClose={() => setEditUser(null)}>
                    <form onSubmit={handleUpdate}>
                        <div className="sigl-dialog-body">
                            <div className="sigl-dialog-secao">
                                <span className="sigl-dialog-secao-titulo">Perfil</span>
                                <div className="sigl-dialog-grid sigl-dialog-grid-2">
                                    <div className="sigl-filtro-campo">
                                        <label htmlFor="usr-edit-nome">Nome exibido *</label>
                                        <input
                                            id="usr-edit-nome"
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            required
                                            minLength={2}
                                        />
                                    </div>
                                    <div className="sigl-filtro-campo">
                                        <label htmlFor="usr-edit-role">Perfil *</label>
                                        <select id="usr-edit-role" value={role} onChange={(e) => setRole(e.target.value)}>
                                            {roleOptions.map((r) => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="sigl-dialog-secao">
                                <span className="sigl-dialog-secao-titulo">Status</span>
                                <div className="sigl-filtro-campo flex align-items-center gap-2">
                                    <input
                                        id="usr-edit-ativo"
                                        type="checkbox"
                                        checked={ativo}
                                        onChange={(e) => setAtivo(e.target.checked)}
                                    />
                                    <label htmlFor="usr-edit-ativo">Usuário ativo</label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setEditUser(null)}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">Salvar</button>
                        </div>
                    </form>
                </Modal>
            )}
        </main>
    );
}
