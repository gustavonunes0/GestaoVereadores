import { FormEvent, useEffect, useState } from 'react';
import { MODULE_ICONS } from '../app/navigation';
import { api, apiList } from '../api/client';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/Modal';
import { PanelToolbar } from '../components/PanelToolbar';
import { usePermissions } from '../hooks/usePermissions';

type Comissao = { id: string; nome: string; ativa: boolean; mensagem?: string };

export function ComissoesPage() {
  const { canWrite } = usePermissions();
  const [items, setItems] = useState<Comissao[]>([]);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState('');

  function load() {
    apiList<Comissao>('/comissoes').then((r) => setItems(r.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await api('/comissoes', { method: 'POST', body: JSON.stringify({ nome }) });
    setOpen(false);
    setNome('');
    load();
  }

  async function remove(id: string) {
    if (!confirm('Excluir comissão?')) return;
    await api(`/comissoes/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <>
      <PanelToolbar
        icon={MODULE_ICONS.comissoes}
        title="Comissões"
        actions={
          canWrite ? (
            <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
              Adicionar comissão
            </button>
          ) : undefined
        }
      />
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ativa</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.nome}</td>
                <td>{c.ativa ? 'Sim' : 'Não'}</td>
                <td>
                  {canWrite && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>
                      Excluir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <EmptyState
            icon="pi pi-sitemap"
            title="Nenhuma comissão cadastrada"
            hint="Crie a primeira comissão para organizar a tramitação das matérias."
          />
        )}
      </div>
      {open && (
        <Modal title="Nova comissão" onClose={() => setOpen(false)}>
          <form onSubmit={handleCreate}>
            <label>
              Nome *
              <input value={nome} onChange={(e) => setNome(e.target.value)} required />
            </label>
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
