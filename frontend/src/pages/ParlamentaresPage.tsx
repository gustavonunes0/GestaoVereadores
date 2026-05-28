import { FormEvent, useEffect, useState } from 'react';
import { api, apiList } from '../api/client';
import { Modal } from '../components/Modal';
import { PanelToolbar } from '../components/PanelToolbar';

type Parlamentar = {
  id: string;
  ativo: boolean;
  pessoa: { nome: string; cpf?: string; email?: string };
};

export function ParlamentaresPage() {
  const [items, setItems] = useState<Parlamentar[]>([]);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');

  function load() {
    apiList<Parlamentar>('/parlamentares').then((r) => setItems(r.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await api('/parlamentares', {
      method: 'POST',
      body: JSON.stringify({ nome, cpf: cpf || undefined, email: email || undefined }),
    });
    setOpen(false);
    setNome('');
    setCpf('');
    setEmail('');
    load();
  }

  async function remove(id: string) {
    if (!confirm('Excluir parlamentar?')) return;
    await api(`/parlamentares/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <>
      <PanelToolbar
        title="Parlamentares"
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
            Adicionar parlamentar
          </button>
        }
      />      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>E-mail</th>
              <th>Ativo</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.pessoa.nome}</td>
                <td>{p.pessoa.cpf ?? '—'}</td>
                <td>{p.pessoa.email ?? '—'}</td>
                <td>{p.ativo ? 'Sim' : 'Não'}</td>
                <td>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <p className="empty">Nenhum parlamentar cadastrado.</p>}
      </div>
      {open && (
        <Modal title="Novo parlamentar" onClose={() => setOpen(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <label>
                Nome *
                <input value={nome} onChange={(e) => setNome(e.target.value)} required />
              </label>
              <label>
                CPF
                <input value={cpf} onChange={(e) => setCpf(e.target.value)} />
              </label>
              <label>
                E-mail
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
