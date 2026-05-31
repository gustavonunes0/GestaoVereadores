import { useCallback, useEffect, useState } from 'react';
import { SiglButton } from '../components/common/SiglButton';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { api, apiList } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { useAppToast } from '../hooks/useAppToast';
import { useEmbeddedPage } from '../hooks/useEmbeddedPage';
import { usePermissions } from '../hooks/usePermissions';
import { digitsOnly } from '../utils/normalizeDocument';

type Parlamentar = {
  id: string;
  ativo: boolean;
  pessoa: { nome: string; cpf?: string; email?: string };
};

export function ParlamentaresPage() {
  const embedded = useEmbeddedPage();
  const { canWrite } = usePermissions();
  const { showSuccess, showApiError, confirmDestructive } = useAppToast();

  const [items, setItems] = useState<Parlamentar[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiList<Parlamentar>('/parlamentares', { limit: 100 });
      setItems(response.data);
    } catch (err) {
      showApiError(err, 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, [showApiError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate() {
    if (!nome.trim()) return;
    setSaving(true);
    try {
      await api('/parlamentares', {
        method: 'POST',
        body: JSON.stringify({
          nome: nome.trim(),
          cpf: cpf ? digitsOnly(cpf) : undefined,
          email: email.trim() || undefined,
        }),
      });
      setOpen(false);
      setNome('');
      setCpf('');
      setEmail('');
      showSuccess('Parlamentar cadastrado com sucesso.');
      await load();
    } catch (err) {
      showApiError(err);
    } finally {
      setSaving(false);
    }
  }

  function handleRemove(row: Parlamentar) {
    confirmDestructive(
      `Excluir o parlamentar "${row.pessoa.nome}"? Esta ação não pode ser desfeita.`,
      async () => {
        try {
          await api(`/parlamentares/${row.id}`, { method: 'DELETE' });
          showSuccess('Parlamentar removido.');
          await load();
        } catch (err) {
          showApiError(err);
        }
      },
    );
  }

  const actionsBody = (row: Parlamentar) =>
    canWrite ? (
      <SiglButton
        icon="pi pi-trash"
        severity="danger"
        text
        rounded
        aria-label="Excluir"
        onClick={() => handleRemove(row)}
      />
    ) : null;

  const ativoBody = (row: Parlamentar) => (
    <Tag
      value={row.ativo ? 'Ativo' : 'Inativo'}
      severity={row.ativo ? 'success' : 'secondary'}
    />
  );

  return (
    <section className="page">
      <PageHeader
        embedded={embedded}
        title="Parlamentares"
        subtitle={
          embedded
            ? undefined
            : 'Vereadores cadastrados na câmara atual (tenant via JWT).'
        }
        actions={
          canWrite ? (
            <SiglButton label="Adicionar parlamentar" icon="pi pi-plus" onClick={() => setOpen(true)} />
          ) : undefined
        }
      />

      <DataTable
        value={items}
        loading={loading}
        dataKey="id"
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Nenhum parlamentar cadastrado. Use o botão acima para incluir o primeiro."
        className="sigl-datatable"
      >
        <Column header="Nome" body={(row: Parlamentar) => row.pessoa.nome} />
        <Column header="CPF" body={(row: Parlamentar) => row.pessoa.cpf ?? '—'} />
        <Column header="E-mail" body={(row: Parlamentar) => row.pessoa.email ?? '—'} />
        <Column header="Situação" body={ativoBody} style={{ width: '8rem' }} />
        {canWrite && (
          <Column header="Ações" body={actionsBody} style={{ width: '5rem' }} />
        )}
      </DataTable>

      <Dialog
        header="Novo parlamentar"
        visible={open}
        onHide={() => !saving && setOpen(false)}
        modal
        className="sigl-dialog-sm"
        footer={
          <div className="dialog-footer">
            <SiglButton
              label="Cancelar"
              severity="secondary"
              text
              disabled={saving}
              onClick={() => setOpen(false)}
            />
            <SiglButton
              label="Salvar"
              icon="pi pi-check"
              loading={saving}
              onClick={() => void handleCreate()}
            />
          </div>
        }
      >
        <div className="form-stack">
          <label htmlFor="parl-nome">Nome *</label>
          <InputText
            id="parl-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full"
          />
          <label htmlFor="parl-cpf">CPF</label>
          <InputText id="parl-cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} className="w-full" />
          <label htmlFor="parl-email">E-mail</label>
          <InputText
            id="parl-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
        </div>
      </Dialog>
    </section>
  );
}
