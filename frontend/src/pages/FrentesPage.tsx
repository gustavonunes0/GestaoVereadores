import { FormEvent, useEffect, useState } from 'react';
import { MODULE_ICONS } from '../app/navigation';
import { api, apiList } from '../api/client';
import { IntGestMensagemField } from '../components/forms/IntGestMensagemField';
import { Modal } from '../components/Modal';
import { PanelToolbar } from '../components/PanelToolbar';
import { usePermissions } from '../hooks/usePermissions';

type Frente = {
  id: string;
  nome: string;
  ativa: boolean;
  dataEntrada?: string;
  dataSaida?: string;
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function FrentesPage() {
  const { canWrite } = usePermissions();
  const [items, setItems] = useState<Frente[]>([]);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [dataEntrada, setDataEntrada] = useState('');
  const [dataSaida, setDataSaida] = useState('');

  function load() {
    apiList<Frente>('/frentes', { limit: 100 }).then((r) => setItems(r.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await api('/frentes', {
      method: 'POST',
      body: JSON.stringify({
        nome,
        mensagem: mensagem.trim() || undefined,
        dataEntrada: dataEntrada
          ? new Date(dataEntrada).toISOString()
          : undefined,
        dataSaida: dataSaida ? new Date(dataSaida).toISOString() : undefined,
      }),
    });
    setOpen(false);
    setNome('');
    setMensagem('');
    setDataEntrada('');
    setDataSaida('');
    load();
  }

  return (
    <>
      <PanelToolbar
        icon={MODULE_ICONS.frentes}
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
              <th>Data entrada</th>
              <th>Data saída</th>
              <th>Ativa</th>
            </tr>
          </thead>
          <tbody>
            {items.map((f) => (
              <tr key={f.id}>
                <td>{f.nome}</td>
                <td>{formatDate(f.dataEntrada)}</td>
                <td>{formatDate(f.dataSaida)}</td>
                <td>{f.ativa ? 'Sim' : 'Não'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title="Nova frente" onClose={() => setOpen(false)}>
          <form onSubmit={handleCreate} className="form-stack">
            <label>
              Nome *
              <input value={nome} onChange={(e) => setNome(e.target.value)} required />
            </label>
            <div className="form-grid-2">
              <label>
                Data de entrada
                <input
                  type="date"
                  value={dataEntrada}
                  onChange={(e) => setDataEntrada(e.target.value)}
                />
              </label>
              <label>
                Data de saída
                <input
                  type="date"
                  value={dataSaida}
                  onChange={(e) => setDataSaida(e.target.value)}
                />
              </label>
            </div>
            <IntGestMensagemField value={mensagem} onChange={setMensagem} />
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
