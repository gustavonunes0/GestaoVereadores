import { FormEvent, useEffect, useState } from 'react';
import { api, apiList } from '../api/client';
import { Modal } from '../components/Modal';
import { PanelToolbar } from '../components/PanelToolbar';
import { usePermissions } from '../hooks/usePermissions';
import { useDominios } from '../hooks/useDominios';

type Autor = {
  id: string;
  nome: string;
  tipoAutor?: { nome: string };
};

export function AutoresPage() {
  const { canWrite } = usePermissions();
  const { dominios } = useDominios();
  const [items, setItems] = useState<Autor[]>([]);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [tipoAutorId, setTipoAutorId] = useState('');

  function load() {
    apiList<Autor>('/autores').then((r) => setItems(r.data));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (dominios?.tiposAutor[0] && !tipoAutorId) {
      setTipoAutorId(dominios.tiposAutor[0].id);
    }
  }, [dominios, tipoAutorId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await api('/autores', {
      method: 'POST',
      body: JSON.stringify({ nome, tipoAutorId }),
    });
    setOpen(false);
    setNome('');
    load();
  }

  async function remove(id: string) {
    if (!confirm('Excluir autor?')) return;
    await api(`/autores/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <>
      <PanelToolbar
        title="Autores"
        actions={
          canWrite ? (
            <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
              Novo autor
            </button>
          ) : undefined
        }
      />
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{a.nome}</td>
                <td>{a.tipoAutor?.nome ?? '—'}</td>
                <td>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(a.id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title="Novo autor" onClose={() => setOpen(false)}>
          <form onSubmit={handleCreate}>
            <label>
              Nome *
              <input value={nome} onChange={(e) => setNome(e.target.value)} required />
            </label>
            <label>
              Tipo *
              <select
                value={tipoAutorId}
                onChange={(e) => setTipoAutorId(e.target.value)}
                required
              >
                {dominios?.tiposAutor.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
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
