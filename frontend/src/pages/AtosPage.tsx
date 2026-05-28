import { FormEvent, useEffect, useState } from 'react';
import { api, apiList } from '../api/client';
import { Modal } from '../components/Modal';
import { PanelToolbar } from '../components/PanelToolbar';
import { useDominios } from '../hooks/useDominios';

type Ato = {
  id: string;
  numero: string;
  tipo?: { nome: string };
  classificacao?: { nome: string };
};

export function AtosPage() {
  const { dominios } = useDominios();
  const [items, setItems] = useState<Ato[]>([]);
  const [open, setOpen] = useState(false);
  const [numero, setNumero] = useState('');
  const [tipoId, setTipoId] = useState('');
  const [classificacaoId, setClassificacaoId] = useState('');

  useEffect(() => {
    apiList<Ato>('/atos').then((r) => setItems(r.data));
  }, []);

  useEffect(() => {
    if (dominios) {
      if (!tipoId && dominios.tiposAto[0]) setTipoId(dominios.tiposAto[0].id);
      if (!classificacaoId && dominios.classificacoesAto[0]) {
        setClassificacaoId(dominios.classificacoesAto[0].id);
      }
    }
  }, [dominios, tipoId, classificacaoId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await api('/atos', {
      method: 'POST',
      body: JSON.stringify({ numero, tipoId, classificacaoId }),
    });
    setOpen(false);
    const list = await apiList<Ato>('/atos');
    setItems(list.data);
  }

  return (
    <>
      <PanelToolbar
        title="Atos"
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
            Adicionar ato
          </button>
        }
      />
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Tipo</th>
              <th>Classificação</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{a.numero}</td>
                <td>{a.tipo?.nome ?? '—'}</td>
                <td>{a.classificacao?.nome ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && dominios && dominios.tiposAto.length > 0 && (
        <Modal title="Novo ato" onClose={() => setOpen(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <label>
                Tipo *
                <select value={tipoId} onChange={(e) => setTipoId(e.target.value)} required>
                  {dominios.tiposAto.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Classificação *
                <select
                  value={classificacaoId}
                  onChange={(e) => setClassificacaoId(e.target.value)}
                  required
                >
                  {dominios.classificacoesAto.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Número *
                <input value={numero} onChange={(e) => setNumero(e.target.value)} required />
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
