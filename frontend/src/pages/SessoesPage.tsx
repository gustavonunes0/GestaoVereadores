import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, apiList } from '../api/client';
import { ContextBanner } from '../components/ContextBanner';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { useLegislatura } from '../contexts/LegislaturaContext';
import { useDominios } from '../hooks/useDominios';

type Sessao = {
  id: string;
  dataInicio: string;
  tipoSessao?: { nome: string };
  situacao?: { nome: string };
  mensagem?: string;
  pautaItens?: { id: string; ordem: number; materia?: { id: string; ementa: string } }[];
  presencas?: { parlamentar?: { pessoa?: { nome: string } }; presente: boolean }[];
};

type Materia = { id: string; ementa: string; tipo?: { nome: string } };

export function SessoesPage() {
  const { dominios } = useDominios();
  const { sessaoLegislativaId, legislaturaAtiva } = useLegislatura();
  const [items, setItems] = useState<Sessao[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Sessao | null>(null);
  const [open, setOpen] = useState(false);
  const [pautaOpen, setPautaOpen] = useState(false);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [dataInicio, setDataInicio] = useState('');
  const [tipoSessaoId, setTipoSessaoId] = useState('');
  const [situacaoId, setSituacaoId] = useState('');
  const [materiaId, setMateriaId] = useState('');
  const [ordemPauta, setOrdemPauta] = useState(1);

  const load = useCallback(() => {
    const params: Record<string, string | number | undefined> = { limit: 50 };
    if (sessaoLegislativaId) params.sessaoLegislativaId = sessaoLegislativaId;
    return apiList<Sessao>('/sessoes', params).then((r) => {
      setItems(r.data);
      if (selectedId && !r.data.some((s) => s.id === selectedId)) {
        setSelectedId(null);
        setDetail(null);
      }
    });
  }, [sessaoLegislativaId, selectedId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    api<Sessao>(`/sessoes/${selectedId}`).then(setDetail);
  }, [selectedId]);

  useEffect(() => {
    if (dominios) {
      if (!tipoSessaoId && dominios.tiposSessao[0]) setTipoSessaoId(dominios.tiposSessao[0].id);
      if (!situacaoId && dominios.situacoesSessao[0]) setSituacaoId(dominios.situacoesSessao[0].id);
    }
  }, [dominios, tipoSessaoId, situacaoId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await api('/sessoes', {
      method: 'POST',
      body: JSON.stringify({
        dataInicio: new Date(dataInicio).toISOString(),
        tipoSessaoId,
        situacaoId,
        sessaoLegislativaId: sessaoLegislativaId || undefined,
      }),
    });
    setOpen(false);
    load();
  }

  async function handleAddPauta(e: FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    await api(`/sessoes/${selectedId}/pauta`, {
      method: 'POST',
      body: JSON.stringify({ materiaId, ordem: ordemPauta }),
    });
    setPautaOpen(false);
    api<Sessao>(`/sessoes/${selectedId}`).then(setDetail);
    load();
  }

  function openPautaModal() {
    apiList<Materia>('/materias', { limit: 100, emTramitacao: true }).then((r) => {
      setMaterias(r.data);
      if (r.data[0]) setMateriaId(r.data[0].id);
      setOrdemPauta((detail?.pautaItens?.length ?? 0) + 1);
      setPautaOpen(true);
    });
  }

  return (
    <>
      <PageHeader
        title="Sessões plenárias"
        subtitle="Pauta e presenças vinculadas à sessão legislativa selecionada no topo."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setOpen(true)}
            disabled={!sessaoLegislativaId}
          >
            Nova sessão
          </button>
        }
      />

      <ContextBanner
        step="Etapa 3"
        hint={
          sessaoLegislativaId
            ? 'Listando sessões da sessão legislativa ativa.'
            : 'Selecione a sessão legislativa na barra superior.'
        }
      />

      {!sessaoLegislativaId && legislaturaAtiva && (
        <p className="alert alert-warn">
          Defina a sessão legislativa na barra superior ou em{' '}
          <Link to="/camara/legislaturas">Legislaturas</Link>.
        </p>
      )}

      <div className="split-view">
        <div className="card table-wrap split-list">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Pauta</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr
                  key={s.id}
                  className={selectedId === s.id ? 'row-selected' : ''}
                  onClick={() => setSelectedId(s.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{new Date(s.dataInicio).toLocaleString('pt-BR')}</td>
                  <td>{s.tipoSessao?.nome ?? '—'}</td>
                  <td>{s.pautaItens?.length ?? 0} itens</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <p className="empty">Nenhuma sessão nesta sessão legislativa.</p>
          )}
        </div>

        <div className="card split-detail">
          {!detail ? (
            <p className="muted">Selecione uma sessão para ver pauta e presenças.</p>
          ) : (
            <>
              <h2 className="card-title">
                {new Date(detail.dataInicio).toLocaleString('pt-BR')}
                <span className="badge" style={{ marginLeft: '0.5rem' }}>
                  {detail.situacao?.nome}
                </span>
              </h2>
              <div className="detail-actions">
                <button type="button" className="btn btn-primary btn-sm" onClick={openPautaModal}>
                  Incluir na pauta
                </button>
                <Link to="/materias" className="btn btn-secondary btn-sm">
                  Ver matérias
                </Link>
              </div>
              <h3 className="detail-subtitle">Pauta</h3>
              {detail.pautaItens?.length ? (
                <ol className="pauta-list">
                  {detail.pautaItens.map((p) => (
                    <li key={p.id}>
                      <span className="pauta-ordem">{p.ordem}</span>
                      {p.materia?.ementa ?? '—'}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="muted">Pauta vazia — inclua matérias em tramitação.</p>
              )}
              <h3 className="detail-subtitle">Presenças ({detail.presencas?.length ?? 0})</h3>
              {detail.presencas?.length ? (
                <ul className="presenca-list">
                  {detail.presencas.map((p, i) => (
                    <li key={i}>
                      {p.parlamentar?.pessoa?.nome ?? '—'} —{' '}
                      {p.presente ? 'Presente' : 'Ausente'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">
                  Registre presenças pela API ou em versão futura desta tela.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {open && dominios && (
        <Modal title="Nova sessão plenária" onClose={() => setOpen(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <label>
                Data início *
                <input
                  type="datetime-local"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  required
                />
              </label>
              <label>
                Tipo *
                <select value={tipoSessaoId} onChange={(e) => setTipoSessaoId(e.target.value)} required>
                  {dominios.tiposSessao.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Situação *
                <select value={situacaoId} onChange={(e) => setSituacaoId(e.target.value)} required>
                  {dominios.situacoesSessao.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Agendar sessão
              </button>
            </div>
          </form>
        </Modal>
      )}

      {pautaOpen && (
        <Modal title="Incluir matéria na pauta" onClose={() => setPautaOpen(false)}>
          <form onSubmit={handleAddPauta}>
            <label>
              Matéria *
              <select value={materiaId} onChange={(e) => setMateriaId(e.target.value)} required>
                {materias.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.tipo?.nome ? `${m.tipo.nome}: ` : ''}
                    {m.ementa.slice(0, 80)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ordem na pauta *
              <input
                type="number"
                min={1}
                value={ordemPauta}
                onChange={(e) => setOrdemPauta(Number(e.target.value))}
                required
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setPautaOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Incluir
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
