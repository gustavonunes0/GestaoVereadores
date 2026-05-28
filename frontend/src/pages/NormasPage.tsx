import { FormEvent, useEffect, useState } from 'react';
import { api, apiList } from '../api/client';
import { Modal } from '../components/Modal';
import { PanelToolbar } from '../components/PanelToolbar';
import { useDominios } from '../hooks/useDominios';

type Norma = {
  id: string;
  numero: string;
  ementa: string;
  tipo?: { nome: string };
};

export function NormasPage() {
  const { dominios } = useDominios();
  const [items, setItems] = useState<Norma[]>([]);
  const [open, setOpen] = useState(false);
  const [numero, setNumero] = useState('');
  const [ementa, setEmenta] = useState('');
  const [tipoId, setTipoId] = useState('');

  useEffect(() => {
    apiList<Norma>('/normas').then((r) => setItems(r.data));
  }, []);

  useEffect(() => {
    if (dominios?.tiposNorma[0] && !tipoId) setTipoId(dominios.tiposNorma[0].id);
  }, [dominios, tipoId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await api('/normas', {
      method: 'POST',
      body: JSON.stringify({ numero, ementa, tipoId }),
    });
    setOpen(false);
    const list = await apiList<Norma>('/normas');
    setItems(list.data);
  }

  return (
    <>
      <PanelToolbar
        title="Normas jurídicas"
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
            Adicionar norma
          </button>
        }
      />
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Tipo</th>
              <th>Ementa</th>
            </tr>
          </thead>
          <tbody>
            {items.map((n) => (
              <tr key={n.id}>
                <td>{n.numero}</td>
                <td>{n.tipo?.nome ?? '—'}</td>
                <td>{n.ementa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && dominios && (
        <Modal title="Nova norma" onClose={() => setOpen(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <label>
                Tipo *
                <select value={tipoId} onChange={(e) => setTipoId(e.target.value)} required>
                  {dominios.tiposNorma.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Número *
                <input value={numero} onChange={(e) => setNumero(e.target.value)} required />
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                Ementa *
                <textarea value={ementa} onChange={(e) => setEmenta(e.target.value)} required />
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
