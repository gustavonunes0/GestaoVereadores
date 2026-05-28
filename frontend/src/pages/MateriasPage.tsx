import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, apiList } from '../api/client';
import { ContextBanner } from '../components/ContextBanner';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { useDominios } from '../hooks/useDominios';

type Materia = {
  id: string;
  ementa: string;
  numero?: number;
  emTramitacao: boolean;
  tipo?: { nome: string };
  statusTramitacao?: { nome: string };
  autor?: { nome: string };
};

export function MateriasPage() {
  const { dominios } = useDominios();
  const [items, setItems] = useState<Materia[]>([]);
  const [filtroTramitacao, setFiltroTramitacao] = useState<'todas' | 'sim' | 'nao'>('todas');
  const [open, setOpen] = useState(false);
  const [ementa, setEmenta] = useState('');
  const [tipoId, setTipoId] = useState('');
  const [statusId, setStatusId] = useState('');
  const [autorId, setAutorId] = useState('');

  function load() {
    const params: Record<string, string | number | boolean | undefined> = { limit: 100 };
    if (filtroTramitacao === 'sim') params.emTramitacao = true;
    if (filtroTramitacao === 'nao') params.emTramitacao = false;
    apiList<Materia>('/materias', params).then((r) => setItems(r.data));
  }

  useEffect(() => {
    load();
  }, [filtroTramitacao]);

  useEffect(() => {
    if (dominios?.tiposMateria[0] && !tipoId) {
      setTipoId(dominios.tiposMateria[0].id);
    }
  }, [dominios, tipoId]);

  useEffect(() => {
    if (dominios?.tiposAutor.length) {
      apiList<{ id: string; nome: string }>('/autores', { limit: 100 }).then((r) => {
        if (r.data[0] && !autorId) setAutorId(r.data[0].id);
      });
    }
  }, [dominios, autorId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await api('/materias', {
      method: 'POST',
      body: JSON.stringify({
        ementa,
        tipoId,
        autorId: autorId || undefined,
        statusTramitacaoId: statusId || undefined,
        emTramitacao: true,
      }),
    });
    setOpen(false);
    setEmenta('');
    load();
  }

  return (
    <>
      <PageHeader
        title="Matérias e proposições"
        subtitle="Entrada no processo legislativo — após cadastro, tramitem e incluam na pauta da sessão."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
            Nova matéria
          </button>
        }
      />

      <ContextBanner
        step="Etapa 2"
        hint="Matérias em tramitação podem ser incluídas na pauta em Sessões."
      />

      <div className="toolbar filters-bar">
        <div className="filter-chips" role="group" aria-label="Filtro tramitação">
          {(
            [
              ['todas', 'Todas'],
              ['sim', 'Em tramitação'],
              ['nao', 'Encerradas'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`chip${filtroTramitacao === value ? ' active' : ''}`}
              onClick={() => setFiltroTramitacao(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <Link to="/sessoes" className="btn btn-secondary btn-sm">
          Ir para sessões →
        </Link>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nº</th>
              <th>Tipo</th>
              <th>Ementa</th>
              <th>Autor</th>
              <th>Status</th>
              <th>Tramitação</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id}>
                <td>{m.numero ?? '—'}</td>
                <td>{m.tipo?.nome ?? '—'}</td>
                <td>{m.ementa}</td>
                <td>{m.autor?.nome ?? '—'}</td>
                <td>{m.statusTramitacao?.nome ?? '—'}</td>
                <td>
                  <span className={`badge ${m.emTramitacao ? '' : 'badge-muted'}`}>
                    {m.emTramitacao ? 'Em tramitação' : 'Encerrada'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="empty">Nenhuma matéria encontrada.</p>}
      </div>

      {open && dominios && (
        <Modal title="Nova matéria" onClose={() => setOpen(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <label>
                Tipo *
                <select value={tipoId} onChange={(e) => setTipoId(e.target.value)} required>
                  {dominios.tiposMateria.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Status tramitação
                <select value={statusId} onChange={(e) => setStatusId(e.target.value)}>
                  <option value="">—</option>
                  {dominios.statusTramitacao.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                Ementa *
                <textarea value={ementa} onChange={(e) => setEmenta(e.target.value)} required />
              </label>
            </div>
            <p className="muted" style={{ fontSize: '0.85rem' }}>
              Após salvar, inclua a matéria na pauta em{' '}
              <Link to="/sessoes" onClick={() => setOpen(false)}>
                Sessões
              </Link>
              .
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Protocolar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
