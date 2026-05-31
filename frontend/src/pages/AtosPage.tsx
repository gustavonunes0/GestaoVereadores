import { useCallback, useEffect, useMemo, useState } from 'react';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { MODULE_ICONS } from '../app/navigation';
import { api, apiList } from '../api/client';
import { SiglButton } from '../components/common/SiglButton';
import { PageHeader } from '../components/PageHeader';
import { PublicacaoFiltersBar } from '../components/publicacao/PublicacaoFiltersBar';
import { PublicacaoMetaGrid } from '../components/publicacao/PublicacaoMetaGrid';
import { PublicacaoModuleIntro } from '../components/publicacao/PublicacaoModuleIntro';
import { useAppToast } from '../hooks/useAppToast';
import { useDominios } from '../hooks/useDominios';
import { PUBLICACAO_MODULES } from '../app/publicacao';
import { WORKFLOW_PIPELINE_TOTAL } from '../app/navigation';
import { EmptyState } from '../components/common/EmptyState';
import { DocumentListPanel } from '../components/workflow/DocumentListPanel';
import { ModulePipelineFooter } from '../components/workflow/ModulePipelineFooter';
import { PipelineStepBadge } from '../components/workflow/PipelineStepBadge';
import { usePermissions } from '../hooks/usePermissions';
import { formatDatePt } from '../utils/formatDate';

type AtoListItem = {
  id: string;
  numero: string;
  dataInicio?: string | null;
  dataFim?: string | null;
  dataPublicacaoInicio?: string | null;
  tipo?: { nome: string };
  classificacao?: { nome: string };
  mensagem?: string | null;
};

type AtoDetail = AtoListItem;

export function AtosPage() {
  const { dominios } = useDominios();
  const { canWrite } = usePermissions();
  const { showSuccess, showApiError } = useAppToast();

  const [items, setItems] = useState<AtoListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroTipoId, setFiltroTipoId] = useState<string | null>(null);
  const [filtroClassificacaoId, setFiltroClassificacaoId] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [numero, setNumero] = useState('');
  const [tipoId, setTipoId] = useState('');
  const [classificacaoId, setClassificacaoId] = useState('');

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<AtoDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const hasFilters = Boolean(filtroTipoId || filtroClassificacaoId);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = { limit: 100 };
      if (filtroTipoId) params.tipoId = filtroTipoId;
      if (filtroClassificacaoId) params.classificacaoId = filtroClassificacaoId;
      const response = await apiList<AtoListItem>('/atos', params);
      setItems(response.data);
    } catch (err) {
      showApiError(err);
    } finally {
      setLoading(false);
    }
  }, [filtroTipoId, filtroClassificacaoId, showApiError]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (dominios) {
      if (!tipoId && dominios.tiposAto[0]) setTipoId(dominios.tiposAto[0].id);
      if (!classificacaoId && dominios.classificacoesAto[0]) {
        setClassificacaoId(dominios.classificacoesAto[0].id);
      }
    }
  }, [dominios, tipoId, classificacaoId]);

  const tipoOptions = useMemo(
    () => [{ id: null, nome: 'Todos os tipos' }, ...(dominios?.tiposAto ?? [])],
    [dominios],
  );

  const classificacaoOptions = useMemo(
    () => [{ id: null, nome: 'Todas as classificações' }, ...(dominios?.classificacoesAto ?? [])],
    [dominios],
  );

  function clearFilters() {
    setFiltroTipoId(null);
    setFiltroClassificacaoId(null);
  }

  async function handleCreate() {
    if (!numero.trim() || !tipoId || !classificacaoId) return;
    setSaving(true);
    try {
      await api('/atos', {
        method: 'POST',
        body: JSON.stringify({ numero: numero.trim(), tipoId, classificacaoId }),
      });
      setOpen(false);
      setNumero('');
      showSuccess('Ato administrativo registrado.');
      await load();
    } catch (err) {
      showApiError(err);
    } finally {
      setSaving(false);
    }
  }

  async function openDetail(id: string) {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);
    try {
      const data = await api<AtoDetail>(`/atos/${id}`);
      setDetail(data);
    } catch (err) {
      showApiError(err);
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  const vigenciaBody = (row: AtoListItem) => {
    const inicio = formatDatePt(row.dataInicio);
    const fim = formatDatePt(row.dataFim);
    if (inicio === '—' && fim === '—') return '—';
    return fim === '—' ? inicio : `${inicio} – ${fim}`;
  };

  const mod = PUBLICACAO_MODULES.atos;

  return (
    <section className="page page--atos">
      <PipelineStepBadge
        step={mod.pipelineStep}
        total={WORKFLOW_PIPELINE_TOTAL}
        label={mod.title}
        domain="administrative"
      />

      <PageHeader
        icon={MODULE_ICONS.atos}
        title="Atos administrativos"
        subtitle="Portarias, nomeações, exonerações, designações e demais atos de gestão administrativa."
        actions={
          canWrite ? (
            <SiglButton label="Registrar ato" icon="pi pi-plus" onClick={() => setOpen(true)} />
          ) : undefined
        }
      />

      <PublicacaoModuleIntro moduleId="atos" />

      <DocumentListPanel title={mod.listPanelTitle} description={mod.listPanelDesc}>
      {dominios && (
        <PublicacaoFiltersBar showClear={hasFilters} onClear={clearFilters}>
          <Dropdown
            value={filtroTipoId}
            options={tipoOptions}
            optionLabel="nome"
            optionValue="id"
            onChange={(e) => setFiltroTipoId(e.value ?? null)}
            placeholder="Tipo de ato"
            className="publicacao-filter-field"
          />
          <Dropdown
            value={filtroClassificacaoId}
            options={classificacaoOptions}
            optionLabel="nome"
            optionValue="id"
            onChange={(e) => setFiltroClassificacaoId(e.value ?? null)}
            placeholder="Classificação / finalidade"
            className="publicacao-filter-field"
          />
        </PublicacaoFiltersBar>
      )}

      {!loading && items.length === 0 ? (
        <EmptyState
          icon="pi pi-inbox"
          title={
            hasFilters
              ? 'Nenhum ato encontrado com os filtros aplicados'
              : 'Nenhum ato administrativo registrado'
          }
          hint={
            hasFilters
              ? 'Ajuste tipo ou classificação e tente novamente.'
              : 'Registre portarias, nomeações e demais atos de gestão interna.'
          }
        />
      ) : (
      <DataTable
        value={items}
        loading={loading}
        dataKey="id"
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Carregando…"
        className="sigl-datatable"
        rowClassName={() => 'table-row-clickable'}
        onRowClick={(e) => void openDetail((e.data as AtoListItem).id)}
      >
        <Column
          header="Tipo"
          body={(row: AtoListItem) => (
            <span className="badge-ato-type">{row.tipo?.nome ?? '—'}</span>
          )}
          style={{ width: '10rem' }}
        />
        <Column
          header="Classificação"
          body={(row: AtoListItem) => (
            <span className="badge-muted">{row.classificacao?.nome ?? '—'}</span>
          )}
          style={{ width: '11rem' }}
        />
        <Column field="numero" header="Número" sortable style={{ width: '6rem' }} />
        <Column header="Vigência" body={vigenciaBody} style={{ width: '9rem' }} />
        <Column
          header="Publicação"
          body={(row: AtoListItem) => formatDatePt(row.dataPublicacaoInicio)}
          style={{ width: '7rem' }}
        />
      </DataTable>
      )}

      </DocumentListPanel>

      <Dialog
        header="Detalhe do ato administrativo"
        visible={detailOpen}
        onHide={() => setDetailOpen(false)}
        modal
        className="sigl-dialog-md"
        footer={
          <div className="dialog-footer">
            <SiglButton label="Fechar" severity="secondary" onClick={() => setDetailOpen(false)} />
          </div>
        }
      >
        {detailLoading && <p className="ui-loading-inline">Carregando ato…</p>}
        {detail && !detailLoading && (
          <div className="publicacao-detail">
            <div className="sigl-cluster">
              <span className="badge-ato-type">{detail.tipo?.nome ?? 'Ato'}</span>
              <span className="badge-muted">{detail.classificacao?.nome ?? '—'}</span>
            </div>
            <PublicacaoMetaGrid
              items={[
                { label: 'Número', value: detail.numero },
                { label: 'Início da vigência', value: formatDatePt(detail.dataInicio) },
                { label: 'Fim da vigência', value: formatDatePt(detail.dataFim) },
                { label: 'Publicação', value: formatDatePt(detail.dataPublicacaoInicio) },
                { label: 'Finalidade', value: detail.classificacao?.nome },
              ]}
            />
            {detail.mensagem && (
              <p className="field-hint">
                <strong>Observação administrativa:</strong> {detail.mensagem}
              </p>
            )}
            <p className="field-hint publicacao-detail__note">
              Anexos e documento assinado poderão ser vinculados quando o módulo de arquivos estiver
              disponível.
            </p>
          </div>
        )}
      </Dialog>

      <Dialog
        header="Registrar ato administrativo"
        visible={open && !!dominios && dominios.tiposAto.length > 0}
        onHide={() => !saving && setOpen(false)}
        modal
        className="sigl-dialog-md"
        footer={
          <div className="dialog-footer">
            <SiglButton label="Cancelar" severity="secondary" text disabled={saving} onClick={() => setOpen(false)} />
            <SiglButton label="Salvar ato" icon="pi pi-check" loading={saving} onClick={() => void handleCreate()} />
          </div>
        }
      >
        {dominios && (
          <div className="form-stack">
            <div className="form-section">
              <p className="form-section__title">Classificação do ato</p>
              <label htmlFor="ato-tipo" className="field-required">
                Tipo de ato
              </label>
              <Dropdown
                id="ato-tipo"
                value={tipoId}
                options={dominios.tiposAto}
                optionLabel="nome"
                optionValue="id"
                onChange={(e) => setTipoId(e.value)}
                className="w-full"
              />
              <label htmlFor="ato-class" className="field-required">
                Classificação / finalidade
              </label>
              <Dropdown
                id="ato-class"
                value={classificacaoId}
                options={dominios.classificacoesAto}
                optionLabel="nome"
                optionValue="id"
                onChange={(e) => setClassificacaoId(e.value)}
                className="w-full"
              />
            </div>
            <div className="form-section">
              <p className="form-section__title">Identificação</p>
              <label htmlFor="ato-numero" className="field-required">
                Número do ato
              </label>
              <InputText
                id="ato-numero"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="w-full"
                placeholder="Ex.: 012/2026"
              />
            </div>
          </div>
        )}
      </Dialog>

      <ModulePipelineFooter current="atos" />
    </section>
  );
}
