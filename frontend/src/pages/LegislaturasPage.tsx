import { FormEvent, useEffect, useState } from 'react';
import { api, apiList } from '../api/client';
import { Modal } from '../components/Modal';
import { PanelToolbar } from '../components/PanelToolbar';
import { usePermissions } from '../hooks/usePermissions';
import { useLegislatura } from '../contexts/LegislaturaContext';

type Legislatura = {
  id: string;
  numero: number;
  dataInicio: string;
  sessoesLegislativas?: { id: string; numero: number }[];
};

export function LegislaturasPage() {
  const { canWrite } = usePermissions();
  const { refresh } = useLegislatura();
  const [items, setItems] = useState<Legislatura[]>([]);
  const [open, setOpen] = useState(false);
  const [numero, setNumero] = useState('20');
  const [dataInicio, setDataInicio] = useState('2025-01-01');

  function load() {
    apiList<Legislatura>('/legislaturas').then((r) => setItems(r.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await api('/legislaturas', {
      method: 'POST',
      body: JSON.stringify({
        numero: Number(numero),
        dataInicio: new Date(dataInicio).toISOString(),
      }),
    });
    setOpen(false);
    await refresh();
    load();
  }

  return (
    <>
      <PanelToolbar
        title="Legislaturas"
        actions={
          canWrite ? (
            <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
              Nova legislatura
            </button>
          ) : undefined
        }
      />
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Início</th>
              <th>Sessões legislativas</th>
            </tr>
          </thead>
          <tbody>
            {items.map((l) => (
              <tr key={l.id}>
                <td>{l.numero}ª</td>
                <td>{new Date(l.dataInicio).toLocaleDateString('pt-BR')}</td>
                <td>{l.sessoesLegislativas?.length ?? 0}</td>
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
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  required
                />
              </label>
              <label>
                Data início *
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  required
                />
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
