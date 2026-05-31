import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiglButton } from '../components/common/SiglButton';
import { api, apiList } from '../api/client';
import { ContextBanner } from '../components/ContextBanner';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { useLegislatura } from '../contexts/LegislaturaContext';
import { useAppToast } from '../hooks/useAppToast';
import { useDominios } from '../hooks/useDominios';
import { usePermissions } from '../hooks/usePermissions';
import {
  SessaoDeliberacaoPanel,
  type PautaItemDeliberacao,
} from '../components/sessoes/SessaoDeliberacaoPanel';
import { canAddMateriaToPauta, MATERIA_STATUS, type MateriaStatus } from '../types/legislative';

type Sessao = {
  id: string;
  dataInicio: string;
  tipoSessao?: { nome: string };
  situacao?: { nome: string; codigo?: string };
  mensagem?: string;
  pautaItens?: PautaItemDeliberacao[];
  presencas?: {
    parlamentarId?: string;
    presente: boolean;
    situacao?: string;
    parlamentar?: { id: string; pessoa?: { nome: string } };
  }[];
};

type Materia = {
  id: string;
  ementa: string;
  tipo?: { nome: string };
  status?: MateriaStatus;
  emTramitacao?: boolean;
};

function sessaoAceitaPauta(situacao?: { nome: string; codigo?: string }): boolean {
  if (situacao?.codigo === 'EM_ANDAMENTO') return true;
  const nome = situacao?.nome?.toLowerCase() ?? '';
  return nome.includes('andamento');
}

export function SessoesPage() {
  const { dominios } = useDominios();
  const { canWrite } = usePermissions();
  const { showApiError, showSuccess } = useAppToast();
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

  const sessaoEmAndamento = useMemo(
    () => !!detail && sessaoAceitaPauta(detail.situacao),
    [detail],
  );

  const podeIncluirPauta = useMemo(
    () => sessaoEmAndamento && canWrite,
    [sessaoEmAndamento, canWrite],
  );

  function refreshDetail() {
    if (!selectedId) return;
    api<Sessao>(`/sessoes/${selectedId}`).then(setDetail);
    void load();
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    try {
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
      showSuccess('Sessão plenária agendada.');
      await load();
    } catch (err) {
      showApiError(err);
    }
  }

  async function handleAddPauta(e: FormEvent) {
    e.preventDefault();
    if (!selectedId || !podeIncluirPauta) return;
    try {
      await api(`/sessoes/${selectedId}/pauta`, {
        method: 'POST',
        body: JSON.stringify({ materiaId, ordem: ordemPauta }),
      });
      setPautaOpen(false);
      showSuccess('Matéria incluída na pauta.');
      api<Sessao>(`/sessoes/${selectedId}`).then(setDetail);
      await load();
    } catch (err) {
      showApiError(err);
    }
  }

  async function openPautaModal() {
    if (!podeIncluirPauta) return;
    try {
      const response = await apiList<Materia>('/materias', {
        limit: 100,
        status: MATERIA_STATUS.EM_TRAMITACAO,
      });
      const elegiveis = response.data.filter((m) => canAddMateriaToPauta(m));
      setMaterias(elegiveis);
      if (elegiveis[0]) setMateriaId(elegiveis[0].id);
      setOrdemPauta((detail?.pautaItens?.length ?? 0) + 1);
      setPautaOpen(true);
    } catch (err) {
      showApiError(err);
    }
  }

  return (
    <section className="page">
      <PageHeader
        title="Sessões plenárias"
        subtitle="Pauta e presenças vinculadas à sessão legislativa selecionada no topo."
        actions={
          canWrite ? (
            <SiglButton
              label="Nova sessão"
              icon="pi pi-plus"
              onClick={() => setOpen(true)}
              disabled={!sessaoLegislativaId}
            />
          ) : undefined
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
        <div className="split-panel split-list">
          <div className="split-panel__body">
            <div className="split-panel__scroll table-wrap">
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
                    >
                      <td>{new Date(s.dataInicio).toLocaleString('pt-BR')}</td>
                      <td>{s.tipoSessao?.nome ?? '—'}</td>
                      <td>{s.pautaItens?.length ?? 0} itens</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {items.length === 0 && (
              <p className="split-panel__empty">
                Nenhuma sessão nesta sessão legislativa.
              </p>
            )}
          </div>
        </div>

        <div className="split-panel split-detail">
          {!detail ? (
            <p className="split-panel__empty">
              Selecione uma sessão para ver pauta e presenças.
            </p>
          ) : (
            <div className="split-panel__body">
            <>
              <h2 className="card-title">
                {new Date(detail.dataInicio).toLocaleString('pt-BR')}
                <span className="badge badge--inline">
                  {detail.situacao?.nome}
                </span>
              </h2>
              <div className="detail-actions sigl-cluster">
                {canWrite && (
                  <SiglButton
                    label="Incluir na pauta"
                    icon="pi pi-list"
                    disabled={!podeIncluirPauta}
                    tooltip={
                      podeIncluirPauta
                        ? undefined
                        : 'Disponível apenas com sessão EM_ANDAMENTO e perfil com permissão de escrita'
                    }
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => void openPautaModal()}
                  />
                )}
                <Link to="/materias">
                  <SiglButton label="Ver matérias" icon="pi pi-file" severity="secondary" outlined />
                </Link>
              </div>
              {selectedId && (
                <SessaoDeliberacaoPanel
                  sessaoId={selectedId}
                  pautaItens={detail.pautaItens ?? []}
                  presencas={detail.presencas ?? []}
                  canWrite={canWrite}
                  sessaoEmAndamento={sessaoEmAndamento}
                  onUpdated={refreshDetail}
                />
              )}
            </>
            </div>
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
                {!materias.length && (
                  <option value="">Nenhuma matéria em tramitação disponível</option>
                )}
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
    </section>
  );
}
