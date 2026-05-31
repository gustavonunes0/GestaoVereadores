import { useCallback, useEffect, useState } from 'react';
import { SiglButton } from '../components/common/SiglButton';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { api, apiList } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { useEmbeddedPage } from '../hooks/useEmbeddedPage';
import { useAppToast } from '../hooks/useAppToast';
import { useDominios } from '../hooks/useDominios';
import { usePermissions } from '../hooks/usePermissions';
import { MATERIA_STATUS, type MateriaStatus } from '../types/legislative';

type Norma = {
  id: string;
  numero: string;
  ementa: string;
  tipo?: { nome: string };
  materiaOrigem?: { id: string; ementa: string; status?: MateriaStatus };
};

type MateriaOption = {
  id: string;
  ementa: string;
  status?: MateriaStatus;
};

export function NormasPage() {
  const embedded = useEmbeddedPage();
  const { dominios } = useDominios();
  const { canWrite } = usePermissions();
  const { showSuccess, showApiError } = useAppToast();

  const [items, setItems] = useState<Norma[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [numero, setNumero] = useState('');
  const [ementa, setEmenta] = useState('');
  const [tipoId, setTipoId] = useState('');
  const [materiaOrigemId, setMateriaOrigemId] = useState<string | null>(null);
  const [materiasAprovadas, setMateriasAprovadas] = useState<MateriaOption[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiList<Norma>('/normas', { limit: 100 });
      setItems(response.data);
    } catch (err) {
      showApiError(err);
    } finally {
      setLoading(false);
    }
  }, [showApiError]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (dominios?.tiposNorma[0] && !tipoId) setTipoId(dominios.tiposNorma[0].id);
  }, [dominios, tipoId]);

  async function openCreateDialog() {
    try {
      const response = await apiList<MateriaOption>('/materias', {
        limit: 100,
        status: MATERIA_STATUS.APROVADA,
      });
      setMateriasAprovadas(response.data);
      setMateriaOrigemId(response.data[0]?.id ?? null);
      setOpen(true);
    } catch (err) {
      showApiError(err);
    }
  }

  async function handleCreate() {
    if (!numero.trim() || !ementa.trim() || !tipoId) return;
    setSaving(true);
    try {
      await api('/normas', {
        method: 'POST',
        body: JSON.stringify({
          numero: numero.trim(),
          ementa: ementa.trim(),
          tipoId,
          materiaOrigemId: materiaOrigemId || undefined,
        }),
      });
      setOpen(false);
      setNumero('');
      setEmenta('');
      showSuccess('Norma jurídica cadastrada.');
      await load();
    } catch (err) {
      showApiError(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page">
      <PageHeader
        embedded={embedded}
        title="Normas jurídicas"
        subtitle={
          embedded
            ? undefined
            : 'Documento legal formalizado. Vincule apenas a matérias já aprovadas.'
        }
        actions={
          canWrite ? (
            <SiglButton label="Adicionar norma" icon="pi pi-plus" onClick={() => void openCreateDialog()} />
          ) : undefined
        }
      />

      <Message
        severity="info"
        className="norma-rule-banner"
        text="Norma jurídica só deve ser criada a partir de matéria com status APROVADA (regra validada também no backend)."
      />

      <DataTable
        value={items}
        loading={loading}
        dataKey="id"
        paginator
        rows={10}
        emptyMessage="Nenhuma norma cadastrada."
        className="sigl-datatable"
      >
        <Column field="numero" header="Número" sortable />
        <Column header="Tipo" body={(row: Norma) => row.tipo?.nome ?? '—'} />
        <Column field="ementa" header="Ementa" />
        <Column
          header="Matéria origem"
          body={(row: Norma) => row.materiaOrigem?.ementa ?? '—'}
        />
      </DataTable>

      <Dialog
        header="Nova norma jurídica"
        visible={open && !!dominios}
        onHide={() => !saving && setOpen(false)}
        modal
        className="sigl-dialog-md"
        footer={
          <div className="dialog-footer">
            <SiglButton label="Cancelar" severity="secondary" text disabled={saving} onClick={() => setOpen(false)} />
            <SiglButton label="Salvar" icon="pi pi-check" loading={saving} onClick={() => void handleCreate()} />
          </div>
        }
      >
        {dominios && (
          <div className="form-stack">
            <label htmlFor="norma-tipo">Tipo *</label>
            <Dropdown
              id="norma-tipo"
              value={tipoId}
              options={dominios.tiposNorma}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setTipoId(e.value)}
              className="w-full"
            />
            <label htmlFor="norma-numero">Número *</label>
            <InputText
              id="norma-numero"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full"
            />
            <label htmlFor="norma-ementa">Ementa *</label>
            <InputTextarea
              id="norma-ementa"
              value={ementa}
              onChange={(e) => setEmenta(e.target.value)}
              rows={3}
              className="w-full"
            />
            <label htmlFor="norma-materia">Matéria origem (aprovada)</label>
            <Dropdown
              id="norma-materia"
              value={materiaOrigemId}
              options={materiasAprovadas}
              optionLabel="ementa"
              optionValue="id"
              onChange={(e) => setMateriaOrigemId(e.value)}
              placeholder={
                materiasAprovadas.length
                  ? 'Selecione a matéria'
                  : 'Nenhuma matéria aprovada disponível'
              }
              disabled={!materiasAprovadas.length}
              className="w-full"
            />
            {!materiasAprovadas.length && (
              <Message
                severity="warn"
                text="Cadastre e aprove uma matéria antes de gerar a norma jurídica."
              />
            )}
          </div>
        )}
      </Dialog>
    </section>
  );
}
