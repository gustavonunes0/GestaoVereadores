import { FormEvent, useCallback, useEffect, useState } from 'react';
import { MODULE_ICONS } from '../app/navigation';
import { api, apiList } from '../api/client';
import { NavDrawer } from '../components/NavDrawer';
import { EmptyState } from '../components/common/EmptyState';
import { IntGestMensagemField } from '../components/forms/IntGestMensagemField';
import { PanelToolbar } from '../components/PanelToolbar';
import { useDominios } from '../hooks/useDominios';
import { usePermissions } from '../hooks/usePermissions';

type ComissaoList = {
  id: string;
  nome: string;
  sigla?: string | null;
  ativa: boolean;
  dataCriacao?: string;
  dataExtincao?: string;
  tipoComissao?: { id: string; nome: string } | null;
};

type ComissaoDetalhe = ComissaoList & {
  mensagem?: string;
  unidadeDeliberativa?: boolean;
  localReuniao?: string | null;
  dataHoraReuniao?: string | null;
  telSalaReuniao?: string | null;
  enderecoSecretaria?: string | null;
  telSecretaria?: string | null;
  faxSecretaria?: string | null;
  secretario?: string | null;
  email?: string | null;
  finalidade?: string | null;
  apelido?: string | null;
  dataInstalacao?: string | null;
  dataPrevistaTermino?: string | null;
  novoPrazo?: string | null;
  dataTermino?: string | null;
};

type FormState = {
  nome: string;
  sigla: string;
  tipoComissaoId: string;
  dataCriacao: string;
  dataExtincao: string;
  ativa: boolean;
  unidadeDeliberativa: boolean;
  localReuniao: string;
  dataHoraReuniao: string;
  telSalaReuniao: string;
  enderecoSecretaria: string;
  telSecretaria: string;
  faxSecretaria: string;
  secretario: string;
  email: string;
  finalidade: string;
  apelido: string;
  dataInstalacao: string;
  dataPrevistaTermino: string;
  novoPrazo: string;
  dataTermino: string;
  mensagem: string;
};

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

function toDateInput(iso?: string | null) {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}

function toDateTimeLocal(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const emptyForm = (): FormState => ({
  nome: '',
  sigla: '',
  tipoComissaoId: '',
  dataCriacao: new Date().toISOString().slice(0, 10),
  dataExtincao: '',
  ativa: true,
  unidadeDeliberativa: false,
  localReuniao: '',
  dataHoraReuniao: '',
  telSalaReuniao: '',
  enderecoSecretaria: '',
  telSecretaria: '',
  faxSecretaria: '',
  secretario: '',
  email: '',
  finalidade: '',
  apelido: '',
  dataInstalacao: '',
  dataPrevistaTermino: '',
  novoPrazo: '',
  dataTermino: '',
  mensagem: '',
});

function detailToForm(row: ComissaoDetalhe): FormState {
  return {
    nome: row.nome,
    sigla: row.sigla ?? '',
    tipoComissaoId: row.tipoComissao?.id ?? '',
    dataCriacao: toDateInput(row.dataCriacao),
    dataExtincao: toDateInput(row.dataExtincao),
    ativa: row.ativa,
    unidadeDeliberativa: row.unidadeDeliberativa ?? false,
    localReuniao: row.localReuniao ?? '',
    dataHoraReuniao: toDateTimeLocal(row.dataHoraReuniao),
    telSalaReuniao: row.telSalaReuniao ?? '',
    enderecoSecretaria: row.enderecoSecretaria ?? '',
    telSecretaria: row.telSecretaria ?? '',
    faxSecretaria: row.faxSecretaria ?? '',
    secretario: row.secretario ?? '',
    email: row.email ?? '',
    finalidade: row.finalidade ?? '',
    apelido: row.apelido ?? '',
    dataInstalacao: toDateInput(row.dataInstalacao),
    dataPrevistaTermino: toDateInput(row.dataPrevistaTermino),
    novoPrazo: toDateInput(row.novoPrazo),
    dataTermino: toDateInput(row.dataTermino),
    mensagem: row.mensagem ?? '',
  };
}

function buildPayload(form: FormState) {
  const trim = (s: string) => s.trim() || undefined;
  const dateIso = (d: string) => (d ? new Date(d).toISOString() : undefined);
  return {
    nome: form.nome.trim(),
    sigla: trim(form.sigla),
    tipoComissaoId: form.tipoComissaoId || undefined,
    dataCriacao: dateIso(form.dataCriacao),
    dataExtincao: dateIso(form.dataExtincao),
    ativa: form.ativa,
    unidadeDeliberativa: form.unidadeDeliberativa,
    localReuniao: trim(form.localReuniao),
    dataHoraReuniao: form.dataHoraReuniao
      ? new Date(form.dataHoraReuniao).toISOString()
      : undefined,
    telSalaReuniao: trim(form.telSalaReuniao),
    enderecoSecretaria: trim(form.enderecoSecretaria),
    telSecretaria: trim(form.telSecretaria),
    faxSecretaria: trim(form.faxSecretaria),
    secretario: trim(form.secretario),
    email: trim(form.email),
    finalidade: trim(form.finalidade),
    apelido: trim(form.apelido),
    dataInstalacao: dateIso(form.dataInstalacao),
    dataPrevistaTermino: dateIso(form.dataPrevistaTermino),
    novoPrazo: dateIso(form.novoPrazo),
    dataTermino: dateIso(form.dataTermino),
    mensagem: trim(form.mensagem),
  };
}

export function ComissoesPage() {
  const { canWrite } = usePermissions();
  const { dominios } = useDominios();
  const [items, setItems] = useState<ComissaoList[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    return apiList<ComissaoList>('/comissoes', { limit: 100 }).then((r) => {
      setItems(r.data);
      if (selectedId && !r.data.some((c) => c.id === selectedId)) {
        setSelectedId(null);
        setCreating(false);
        setForm(emptyForm());
      }
    });
  }, [selectedId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (creating) return;
    if (!selectedId) {
      setForm(emptyForm());
      return;
    }
    api<ComissaoDetalhe>(`/comissoes/${selectedId}`).then((d) => setForm(detailToForm(d)));
  }, [selectedId, creating]);

  function startCreate() {
    setSelectedId(null);
    setCreating(true);
    const f = emptyForm();
    if (dominios?.tiposComissao[0]) {
      f.tipoComissaoId = dominios.tiposComissao[0].id;
    }
    setForm(f);
  }

  function selectRow(id: string) {
    setCreating(false);
    setSelectedId(id);
  }

  function closeDrawer() {
    setSelectedId(null);
    setCreating(false);
    setForm(emptyForm());
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canWrite) return;
    setSaving(true);
    try {
      const body = buildPayload(form);
      if (creating) {
        const created = await api<ComissaoDetalhe>('/comissoes', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        setCreating(false);
        setSelectedId(created.id);
        await load();
      } else if (selectedId) {
        await api(`/comissoes/${selectedId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Excluir comissão?')) return;
    await api(`/comissoes/${id}`, { method: 'DELETE' });
    if (selectedId === id) {
      closeDrawer();
    }
    load();
  }

  const editing = creating || !!selectedId;

  return (
    <>
      <PanelToolbar
        icon={MODULE_ICONS.comissoes}
        title="Comissões"
        actions={
          canWrite ? (
            <button type="button" className="btn btn-primary" onClick={startCreate}>
              Adicionar comissão
            </button>
          ) : undefined
        }
      />

      <p className="muted" style={{ margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
        Clique em uma comissão na tabela para abrir o cadastro no painel lateral.
      </p>

      <div className="list-panel">
        <div className="list-panel__body">
          <div className="list-panel__scroll table-wrap">
            <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Sigla</th>
                    <th>Tipo</th>
                    <th>Criação</th>
                    <th>Extinção</th>
                    <th>Ativa?</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr
                      key={c.id}
                      className={selectedId === c.id && !creating ? 'row-selected' : ''}
                      onClick={() => selectRow(c.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{c.nome}</td>
                      <td>{c.sigla ?? '—'}</td>
                      <td>{c.tipoComissao?.nome ?? '—'}</td>
                      <td>{formatDate(c.dataCriacao)}</td>
                      <td>{formatDate(c.dataExtincao)}</td>
                      <td>{c.ativa ? 'Sim' : 'Não'}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {canWrite && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => remove(c.id)}
                          >
                            Excluir
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {items.length === 0 && (
              <EmptyState
                icon="pi pi-sitemap"
                title="Nenhuma comissão cadastrada"
                hint="Cadastre comissões como no IntGest (ex.: CDFO, CDJR)."
              />
            )}
        </div>
      </div>

      <NavDrawer
        visible={editing}
        onHide={closeDrawer}
        wide
        title={
          creating ? 'Nova comissão' : `${form.sigla || '—'} — ${form.nome || 'Comissão'}`
        }
        subtitle={creating ? 'Dados básicos, complementares e comissão temporária.' : undefined}
      >
        <form onSubmit={handleSubmit} className="form-stack">
                <div className="form-section">
                  <p className="form-section__title">Dados básicos</p>
                  <label>
                    Nome *
                    <input
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      required
                      disabled={!canWrite}
                    />
                  </label>
                  <div className="form-grid-2">
                    <label>
                      Sigla
                      <input
                        value={form.sigla}
                        onChange={(e) =>
                          setForm({ ...form, sigla: e.target.value.toUpperCase() })
                        }
                        placeholder="Ex.: CDFO"
                        maxLength={12}
                        disabled={!canWrite}
                      />
                    </label>
                    <label>
                      Tipo
                      <select
                        value={form.tipoComissaoId}
                        onChange={(e) =>
                          setForm({ ...form, tipoComissaoId: e.target.value })
                        }
                        disabled={!canWrite}
                      >
                        <option value="">—</option>
                        {dominios?.tiposComissao.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nome}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="form-grid-2">
                    <label>
                      Data de criação
                      <input
                        type="date"
                        value={form.dataCriacao}
                        onChange={(e) => setForm({ ...form, dataCriacao: e.target.value })}
                        disabled={!canWrite}
                      />
                    </label>
                    <label>
                      Data de extinção
                      <input
                        type="date"
                        value={form.dataExtincao}
                        onChange={(e) => setForm({ ...form, dataExtincao: e.target.value })}
                        disabled={!canWrite}
                      />
                    </label>
                  </div>
                  <label className="label-inline">
                    <input
                      type="checkbox"
                      checked={form.ativa}
                      onChange={(e) => setForm({ ...form, ativa: e.target.checked })}
                      disabled={!canWrite}
                    />
                    Comissão ativa?
                  </label>
                  <label className="label-inline">
                    <input
                      type="checkbox"
                      checked={form.unidadeDeliberativa}
                      onChange={(e) =>
                        setForm({ ...form, unidadeDeliberativa: e.target.checked })
                      }
                      disabled={!canWrite}
                    />
                    Unidade deliberativa?
                  </label>
                </div>

                <div className="form-section">
                  <p className="form-section__title">Dados complementares</p>
                  <label>
                    Local reunião
                    <input
                      value={form.localReuniao}
                      onChange={(e) => setForm({ ...form, localReuniao: e.target.value })}
                      disabled={!canWrite}
                    />
                  </label>
                  <label>
                    Data/hora reunião
                    <input
                      type="datetime-local"
                      value={form.dataHoraReuniao}
                      onChange={(e) =>
                        setForm({ ...form, dataHoraReuniao: e.target.value })
                      }
                      disabled={!canWrite}
                    />
                  </label>
                  <label>
                    Tel. sala reunião
                    <input
                      value={form.telSalaReuniao}
                      onChange={(e) => setForm({ ...form, telSalaReuniao: e.target.value })}
                      disabled={!canWrite}
                    />
                  </label>
                  <label>
                    Endereço secretaria
                    <input
                      value={form.enderecoSecretaria}
                      onChange={(e) =>
                        setForm({ ...form, enderecoSecretaria: e.target.value })
                      }
                      disabled={!canWrite}
                    />
                  </label>
                  <div className="form-grid-2">
                    <label>
                      Tel. secretaria
                      <input
                        value={form.telSecretaria}
                        onChange={(e) => setForm({ ...form, telSecretaria: e.target.value })}
                        disabled={!canWrite}
                      />
                    </label>
                    <label>
                      Fax secretaria
                      <input
                        value={form.faxSecretaria}
                        onChange={(e) => setForm({ ...form, faxSecretaria: e.target.value })}
                        disabled={!canWrite}
                      />
                    </label>
                  </div>
                  <label>
                    Secretário
                    <input
                      value={form.secretario}
                      onChange={(e) => setForm({ ...form, secretario: e.target.value })}
                      disabled={!canWrite}
                    />
                  </label>
                  <label>
                    E-mail
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      disabled={!canWrite}
                    />
                  </label>
                  <label>
                    Finalidade
                    <textarea
                      rows={5}
                      value={form.finalidade}
                      onChange={(e) => setForm({ ...form, finalidade: e.target.value })}
                      disabled={!canWrite}
                      placeholder="Competências e atribuições da comissão (como no IntGest)"
                    />
                  </label>
                </div>

                <div className="form-section">
                  <p className="form-section__title">Temporária</p>
                    <label>
                      Apelido
                      <input
                        value={form.apelido}
                        onChange={(e) => setForm({ ...form, apelido: e.target.value })}
                        disabled={!canWrite}
                      />
                    </label>
                    <div className="form-grid-2">
                      <label>
                        Data instalação
                        <input
                          type="date"
                          value={form.dataInstalacao}
                          onChange={(e) =>
                            setForm({ ...form, dataInstalacao: e.target.value })
                          }
                          disabled={!canWrite}
                        />
                      </label>
                      <label>
                        Data prevista término
                        <input
                          type="date"
                          value={form.dataPrevistaTermino}
                          onChange={(e) =>
                            setForm({ ...form, dataPrevistaTermino: e.target.value })
                          }
                          disabled={!canWrite}
                        />
                      </label>
                    </div>
                    <div className="form-grid-2">
                      <label>
                        Novo prazo
                        <input
                          type="date"
                          value={form.novoPrazo}
                          onChange={(e) => setForm({ ...form, novoPrazo: e.target.value })}
                          disabled={!canWrite}
                        />
                      </label>
                      <label>
                        Data término
                        <input
                          type="date"
                          value={form.dataTermino}
                          onChange={(e) => setForm({ ...form, dataTermino: e.target.value })}
                          disabled={!canWrite}
                        />
                      </label>
                    </div>
                </div>

                <IntGestMensagemField
                  value={form.mensagem}
                  onChange={(v) => setForm({ ...form, mensagem: v })}
                />

                {canWrite && (
                  <div className="detail-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Salvando…' : creating ? 'Criar comissão' : 'Salvar alterações'}
                    </button>
                    {creating && (
                      <button type="button" className="btn btn-secondary" onClick={closeDrawer}>
                        Cancelar
                      </button>
                    )}
                  </div>
                )}
        </form>
      </NavDrawer>
    </>
  );
}
