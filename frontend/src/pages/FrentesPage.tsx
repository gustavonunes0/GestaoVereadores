import { FormEvent, useEffect, useState } from 'react';
import { api, apiList } from '../api/client';
import { Modal } from '../components/Modal';
import { PanelToolbar } from '../components/PanelToolbar';
import { usePermissions } from '../hooks/usePermissions';

type Frente = { id: string; nome: string; ativa: boolean };

export function FrentesPage() {
  const { canWrite } = usePermissions();
  const [items, setItems] = useState<Frente[]>([]);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState('');

  useEffect(() => {
    apiList<Frente>('/frentes').then((r) => setItems(r.data));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await api('/frentes', { method: 'POST', body: JSON.stringify({ nome }) });
    setOpen(false);
    setNome('');
    const list = await apiList<Frente>('/frentes');
    setItems(list.data);
  }

  return (
    <>
      <PanelToolbar
        title="Frentes parlamentares"
        actions={
          canWrite ? (
            <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
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
              <th>Ativa</th>
            </tr>
          </thead>
          <tbody>
            {items.map((f) => (
              <tr key={f.id}>
                <td>{f.nome}</td>
                <td>{f.ativa ? 'Sim' : 'Não'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title="Nova frente" onClose={() => setOpen(false)}>
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
