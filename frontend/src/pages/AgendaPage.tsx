import { FormEvent, useEffect, useState } from 'react';
import { MODULE_ICONS } from '../app/navigation';
import { api, apiList } from '../api/client';
import { IntGestMensagemField } from '../components/forms/IntGestMensagemField';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { PanelToolbar } from '../components/PanelToolbar';
import { usePermissions } from '../hooks/usePermissions';

type Agenda = {
  id: string;
  numero?: string;
  titulo?: string;
  dataInicio?: string;
  dataFim?: string;
  mensagem?: string;
};

export function AgendaPage() {
  const { canWrite } = usePermissions();
  const [items, setItems] = useState<Agenda[]>([]);
  const [open, setOpen] = useState(false);
  const [numero, setNumero] = useState('');
  const [titulo, setTitulo] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [mensagem, setMensagem] = useState('');

  function load() {
    apiList<Agenda>('/agenda', { limit: 100 }).then((r) => setItems(r.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await api('/agenda', {
      method: 'POST',
      body: JSON.stringify({
        numero: numero.trim() || undefined,
        titulo: titulo.trim() || undefined,
        dataInicio: dataInicio ? new Date(dataInicio).toISOString() : undefined,
        dataFim: dataFim ? new Date(dataFim).toISOString() : undefined,
        mensagem: mensagem.trim() || undefined,
      }),
    });
    setOpen(false);
    setNumero('');
    setTitulo('');
    setDataInicio('');
    setDataFim('');
    setMensagem('');
    load();
  }

  async function remove(id: string) {
    if (!confirm('Excluir item da agenda?')) return;
    await api(`/agenda/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <section className="page">
      <PageHeader
        icon={MODULE_ICONS.agenda}
        title="Agenda legislativa"
        subtitle="Compromissos e eventos — campos alinhados ao SIGL (número, período, mensagem)."
      />
      <PanelToolbar
        icon={MODULE_ICONS.agenda}
        title="Pesquisar agenda"
        actions={
          canWrite ? (
            <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
              Adicionar agenda
            </button>
          ) : undefined
        }
      />
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Título</th>
              <th>Início</th>
              <th>Fim</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{a.numero ?? '—'}</td>
                <td>{a.titulo ?? '—'}</td>
                <td>
                  {a.dataInicio
                    ? new Date(a.dataInicio).toLocaleString('pt-BR')
                    : '—'}
                </td>
                <td>
                  {a.dataFim ? new Date(a.dataFim).toLocaleString('pt-BR') : '—'}
                </td>
                <td>
                  {canWrite && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => remove(a.id)}
                    >
                      Excluir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="muted" style={{ padding: '1rem' }}>
            Nenhum registro na agenda.
          </p>
        )}
      </div>

      {open && (
        <Modal title="Adicionar agenda" onClose={() => setOpen(false)}>
          <form onSubmit={handleCreate} className="form-stack">
            <label>
              Número
              <input value={numero} onChange={(e) => setNumero(e.target.value)} />
            </label>
            <label>
              Título / assunto
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </label>
            <label>
              Data início
              <input
                type="datetime-local"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </label>
            <label>
              Data fim
              <input
                type="datetime-local"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </label>
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
    </section>
  );
}
