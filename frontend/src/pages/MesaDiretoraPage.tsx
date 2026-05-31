import { FormEvent, useEffect, useState } from 'react';
import { api, apiList } from '../api/client';
import { Modal } from '../components/Modal';
import { PanelToolbar } from '../components/PanelToolbar';
import { usePermissions } from '../hooks/usePermissions';

type Mesa = {
  id: string;
  legislatura?: { numero: number };
  membros?: { parlamentar?: { pessoa?: { nome: string } }; cargo?: { nome: string } }[];
};

type Legislatura = { id: string; numero: number };

export function MesaDiretoraPage() {
  const { canWrite } = usePermissions();
  const [items, setItems] = useState<Mesa[]>([]);
  const [legislaturas, setLegislaturas] = useState<Legislatura[]>([]);
  const [open, setOpen] = useState(false);
  const [legislaturaId, setLegislaturaId] = useState('');

  useEffect(() => {
    apiList<Mesa>('/mesa-diretora').then((r) => setItems(r.data));
    apiList<Legislatura>('/legislaturas').then((list) => {
      setLegislaturas(list.data);
      if (list.data[0]) setLegislaturaId(list.data[0].id);
    });
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await api('/mesa-diretora', {
      method: 'POST',
      body: JSON.stringify({ legislaturaId }),
    });
    setOpen(false);
    apiList<Mesa>('/mesa-diretora').then((r) => setItems(r.data));
  }

  return (
    <>
      <PanelToolbar
        title="Mesa diretora"
        actions={
          canWrite ? (
            <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
              Nova composição
            </button>
          ) : undefined
        }
      />
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Legislatura</th>
              <th>Membros</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id}>
                <td>{m.legislatura?.numero ?? '—'}ª</td>
                <td>
                  {m.membros?.length
                    ? m.membros
                        .map(
                          (mb) =>
                            `${mb.cargo?.nome}: ${mb.parlamentar?.pessoa?.nome ?? '—'}`,
                        )
                        .join('; ')
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title="Nova mesa diretora" onClose={() => setOpen(false)}>
          <form onSubmit={handleCreate}>
            <label>
              Legislatura *
              <select
                value={legislaturaId}
                onChange={(e) => setLegislaturaId(e.target.value)}
                required
              >
                {legislaturas.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.numero}ª legislatura
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
