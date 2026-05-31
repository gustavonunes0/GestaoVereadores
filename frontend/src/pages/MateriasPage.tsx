import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiglButton } from '../components/common/SiglButton';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { SelectButton } from 'primereact/selectbutton';
import { Tag } from 'primereact/tag';
import { api, apiList } from '../api/client';
import { MODULE_ICONS } from '../app/navigation';
import { ContextBanner } from '../components/ContextBanner';
import { PageHeader } from '../components/PageHeader';
import { useAppToast } from '../hooks/useAppToast';
import { useDominios } from '../hooks/useDominios';
import { usePermissions } from '../hooks/usePermissions';
import {
  MATERIA_STATUS,
  MATERIA_STATUS_LABELS,
  type MateriaStatus,
} from '../types/legislative';

type Materia = {
  id: string;
  ementa: string;
  numero?: number;
  emTramitacao: boolean;
  status?: MateriaStatus;
  tipo?: { nome: string };
  statusTramitacao?: { nome: string };
  autor?: { nome: string };
};

const TRAMITACAO_FILTER_OPTIONS = [
  { label: 'Todas', value: 'todas' },
  { label: 'Em tramitação', value: 'sim' },
  { label: 'Encerradas', value: 'nao' },
] as const;

export function MateriasPage() {
  const { dominios } = useDominios();
  const { canWrite } = usePermissions();
  const { showSuccess, showApiError } = useAppToast();

  const [items, setItems] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroTramitacao, setFiltroTramitacao] = useState<'todas' | 'sim' | 'nao'>('todas');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ementa, setEmenta] = useState('');
  const [tipoId, setTipoId] = useState('');
  const [statusId, setStatusId] = useState('');
  const [autorId, setAutorId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string | number | boolean | undefined> = { limit: 100 };
    if (filtroTramitacao === 'sim') {
      params.status = MATERIA_STATUS.EM_TRAMITACAO;
    } else if (filtroTramitacao === 'nao') {
      params.emTramitacao = false;
    }
    try {
      const response = await apiList<Materia>('/materias', params);
      setItems(response.data);
    } catch (err) {
      showApiError(err);
    } finally {
      setLoading(false);
    }
  }, [filtroTramitacao, showApiError]);

  useEffect(() => {
    void load();
  }, [load]);

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

  async function handleCreate() {
    if (!ementa.trim() || !tipoId) return;
    setSaving(true);
    try {
      await api('/materias', {
        method: 'POST',
        body: JSON.stringify({
          ementa: ementa.trim(),
          tipoId,
          autorId: autorId || undefined,
          statusTramitacaoId: statusId || undefined,
          status: MATERIA_STATUS.EM_TRAMITACAO,
          emTramitacao: true,
        }),
      });
      setOpen(false);
      setEmenta('');
      showSuccess('Matéria protocolada. Inclua na pauta em Sessões quando a sessão estiver em andamento.');
      await load();
    } catch (err) {
      showApiError(err);
    } finally {
      setSaving(false);
    }
  }

  const statusBody = (row: Materia) => {
    const label = row.status
      ? MATERIA_STATUS_LABELS[row.status]
      : row.emTramitacao
        ? 'Em tramitação'
        : 'Encerrada';
    const severity =
      row.status === MATERIA_STATUS.APROVADA
        ? 'success'
        : row.status === MATERIA_STATUS.EM_TRAMITACAO || row.emTramitacao
          ? 'info'
          : 'secondary';
    return <Tag value={label} severity={severity} />;
  };

  return (
    <section className="page">
      <PageHeader
        icon={MODULE_ICONS.materias}
        title="Matérias e proposições"
        subtitle="Somente matérias em tramitação podem entrar na pauta de sessão em andamento."
        actions={
          canWrite ? (
            <SiglButton label="Nova matéria" icon="pi pi-plus" onClick={() => setOpen(true)} />
          ) : undefined
        }
      />

      <ContextBanner
        step="Etapa 2"
        hint="Matérias com status EM_TRAMITACAO podem ser incluídas na pauta em Sessões."
      />

      <div className="toolbar filters-bar">
        <div className="filters-bar__filters">
          <SelectButton
            className="sigl-selectbutton"
            value={filtroTramitacao}
            onChange={(e) => setFiltroTramitacao(e.value)}
            options={[...TRAMITACAO_FILTER_OPTIONS]}
            optionLabel="label"
            optionValue="value"
          />
        </div>
        <div className="filters-bar__actions">
          <Link to="/sessoes">
            <SiglButton label="Ir para sessões" icon="pi pi-arrow-right" severity="secondary" text />
          </Link>
        </div>
      </div>

      <DataTable
        value={items}
        loading={loading}
        dataKey="id"
        paginator
        rows={10}
        emptyMessage="Nenhuma matéria encontrada para o filtro selecionado."
        className="sigl-datatable"
      >
        <Column header="Nº" body={(row: Materia) => row.numero ?? '—'} style={{ width: '4rem' }} />
        <Column header="Tipo" body={(row: Materia) => row.tipo?.nome ?? '—'} />
        <Column header="Ementa" body={(row: Materia) => row.ementa} />
        <Column header="Autor" body={(row: Materia) => row.autor?.nome ?? '—'} />
        <Column
          header="Status tramitação"
          body={(row: Materia) => row.statusTramitacao?.nome ?? '—'}
        />
        <Column header="Situação" body={statusBody} style={{ width: '10rem' }} />
      </DataTable>

      <Dialog
        header="Nova matéria"
        visible={open && !!dominios}
        onHide={() => !saving && setOpen(false)}
        modal
        className="sigl-dialog-md"
        footer={
          <div className="dialog-footer">
            <SiglButton label="Cancelar" severity="secondary" text disabled={saving} onClick={() => setOpen(false)} />
            <SiglButton label="Protocolar" icon="pi pi-check" loading={saving} onClick={() => void handleCreate()} />
          </div>
        }
      >
        {dominios && (
          <div className="form-stack">
            <label htmlFor="mat-tipo">Tipo *</label>
            <Dropdown
              id="mat-tipo"
              value={tipoId}
              options={dominios.tiposMateria}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setTipoId(e.value)}
              className="w-full"
            />
            <label htmlFor="mat-status-tram">Status tramitação</label>
            <Dropdown
              id="mat-status-tram"
              value={statusId}
              options={[{ id: '', nome: '—' }, ...dominios.statusTramitacao]}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setStatusId(e.value)}
              className="w-full"
            />
            <label htmlFor="mat-ementa">Ementa *</label>
            <InputTextarea
              id="mat-ementa"
              value={ementa}
              onChange={(e) => setEmenta(e.target.value)}
              rows={4}
              className="w-full"
            />
            <p className="form-hint">
              Após salvar, inclua na pauta em{' '}
              <Link to="/sessoes" onClick={() => setOpen(false)}>
                Sessões
              </Link>{' '}
              (sessão em andamento).
            </p>
          </div>
        )}
      </Dialog>
    </section>
  );
}
