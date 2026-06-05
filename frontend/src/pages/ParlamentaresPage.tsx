import { FormEvent, useCallback, useEffect, useState } from 'react';
import { MODULE_ICONS } from '../app/navigation';
import { api, apiList } from '../api/client';
import { NavDrawer } from '../components/NavDrawer';
import { EmptyState } from '../components/common/EmptyState';
import { IntGestMensagemField } from '../components/forms/IntGestMensagemField';
import { PanelToolbar } from '../components/PanelToolbar';
import { useAppToast } from '../hooks/useAppToast';
import { usePermissions } from '../hooks/usePermissions';
import { digitsOnly } from '../utils/normalizeDocument';
import {
  NIVEL_INSTRUCAO_OPCOES,
  SEXO_OPCOES,
  SITUACAO_MILITAR_OPCOES,
  UF_OPCOES,
} from '../utils/parlamentarOptions';

type Legislatura = { id: string; numero: number };

type Mandato = {
  id: string;
  legislaturaId: string;
  titular: boolean;
  ativo: boolean;
  dataPosse?: string | null;
  dataFim?: string | null;
  dataExpedicaoDiploma?: string | null;
  legislatura?: { numero: number };
};

type ParlamentarList = {
  id: string;
  ativo: boolean;
  partido?: string | null;
  gabinete?: string | null;
  pessoa: {
    nome: string;
    nomeParlamentar?: string | null;
    cpf?: string | null;
    email?: string | null;
  };
  mandatos?: Mandato[];
};

type ParlamentarDetalhe = ParlamentarList & {
  profissao?: string | null;
  situacaoMilitar?: string | null;
  nivelInstrucao?: string | null;
  fotoUrl?: string | null;
  biografia?: string | null;
  mensagem?: string | null;
  pessoa: ParlamentarList['pessoa'] & {
    rg?: string | null;
    tituloEleitor?: string | null;
    dataNascimento?: string | null;
    sexo?: string | null;
    telefone?: string | null;
    celular?: string | null;
    cep?: string | null;
    logradouro?: string | null;
    numeroEndereco?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    uf?: string | null;
    site?: string | null;
  };
  mandatos: Mandato[];
};

type MandatoForm = {
  clientId: string;
  id?: string;
  legislaturaId: string;
  titular: boolean;
  ativo: boolean;
  dataPosse: string;
  dataFim: string;
  dataExpedicaoDiploma: string;
};

type FormState = {
  nome: string;
  nomeParlamentar: string;
  cpf: string;
  rg: string;
  tituloEleitor: string;
  dataNascimento: string;
  sexo: string;
  email: string;
  telefone: string;
  celular: string;
  cep: string;
  logradouro: string;
  numeroEndereco: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  site: string;
  partido: string;
  profissao: string;
  gabinete: string;
  situacaoMilitar: string;
  nivelInstrucao: string;
  fotoUrl: string;
  biografia: string;
  ativo: boolean;
  mensagem: string;
  mandatos: MandatoForm[];
};

function toDateInput(iso?: string | null) {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}

function displayNome(row: ParlamentarList) {
  return row.pessoa.nomeParlamentar || row.pessoa.nome;
}

function emptyMandato(legislaturaId = ''): MandatoForm {
  return {
    clientId: crypto.randomUUID(),
    legislaturaId,
    titular: true,
    ativo: true,
    dataPosse: '',
    dataFim: '',
    dataExpedicaoDiploma: '',
  };
}

const emptyForm = (): FormState => ({
  nome: '',
  nomeParlamentar: '',
  cpf: '',
  rg: '',
  tituloEleitor: '',
  dataNascimento: '',
  sexo: '',
  email: '',
  telefone: '',
  celular: '',
  cep: '',
  logradouro: '',
  numeroEndereco: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  site: '',
  partido: '',
  profissao: '',
  gabinete: '',
  situacaoMilitar: '',
  nivelInstrucao: '',
  fotoUrl: '',
  biografia: '',
  ativo: true,
  mensagem: '',
  mandatos: [],
});

function detailToForm(row: ParlamentarDetalhe): FormState {
  return {
    nome: row.pessoa.nome,
    nomeParlamentar: row.pessoa.nomeParlamentar ?? '',
    cpf: row.pessoa.cpf ?? '',
    rg: row.pessoa.rg ?? '',
    tituloEleitor: row.pessoa.tituloEleitor ?? '',
    dataNascimento: toDateInput(row.pessoa.dataNascimento),
    sexo: row.pessoa.sexo ?? '',
    email: row.pessoa.email ?? '',
    telefone: row.pessoa.telefone ?? '',
    celular: row.pessoa.celular ?? '',
    cep: row.pessoa.cep ?? '',
    logradouro: row.pessoa.logradouro ?? '',
    numeroEndereco: row.pessoa.numeroEndereco ?? '',
    complemento: row.pessoa.complemento ?? '',
    bairro: row.pessoa.bairro ?? '',
    cidade: row.pessoa.cidade ?? '',
    uf: row.pessoa.uf ?? '',
    site: row.pessoa.site ?? '',
    partido: row.partido ?? '',
    profissao: row.profissao ?? '',
    gabinete: row.gabinete ?? '',
    situacaoMilitar: row.situacaoMilitar ?? '',
    nivelInstrucao: row.nivelInstrucao ?? '',
    fotoUrl: row.fotoUrl ?? '',
    biografia: row.biografia ?? '',
    ativo: row.ativo,
    mensagem: row.mensagem ?? '',
    mandatos: (row.mandatos ?? []).map((m) => ({
      clientId: m.id,
      id: m.id,
      legislaturaId: m.legislaturaId,
      titular: m.titular,
      ativo: m.ativo,
      dataPosse: toDateInput(m.dataPosse),
      dataFim: toDateInput(m.dataFim),
      dataExpedicaoDiploma: toDateInput(m.dataExpedicaoDiploma),
    })),
  };
}

function buildPayload(form: FormState) {
  const trim = (s: string) => s.trim() || undefined;
  const dateIso = (d: string) => (d ? new Date(d).toISOString() : undefined);
  return {
    nome: form.nome.trim(),
    nomeParlamentar: trim(form.nomeParlamentar),
    cpf: form.cpf ? digitsOnly(form.cpf) : undefined,
    rg: trim(form.rg),
    tituloEleitor: trim(form.tituloEleitor),
    dataNascimento: dateIso(form.dataNascimento),
    sexo: trim(form.sexo),
    email: trim(form.email),
    telefone: trim(form.telefone),
    celular: trim(form.celular),
    cep: trim(form.cep),
    logradouro: trim(form.logradouro),
    numeroEndereco: trim(form.numeroEndereco),
    complemento: trim(form.complemento),
    bairro: trim(form.bairro),
    cidade: trim(form.cidade),
    uf: trim(form.uf),
    site: trim(form.site),
    partido: trim(form.partido),
    profissao: trim(form.profissao),
    gabinete: trim(form.gabinete),
    situacaoMilitar: trim(form.situacaoMilitar),
    nivelInstrucao: trim(form.nivelInstrucao),
    fotoUrl: trim(form.fotoUrl),
    biografia: trim(form.biografia),
    ativo: form.ativo,
    mensagem: trim(form.mensagem),
    mandatos: form.mandatos
      .filter((m) => m.legislaturaId)
      .map((m) => ({
        id: m.id,
        legislaturaId: m.legislaturaId,
        titular: m.titular,
        ativo: m.ativo,
        dataPosse: dateIso(m.dataPosse),
        dataFim: dateIso(m.dataFim),
        dataExpedicaoDiploma: dateIso(m.dataExpedicaoDiploma),
      })),
  };
}

export function ParlamentaresPage() {
  const { canWrite } = usePermissions();
  const { showSuccess, showApiError } = useAppToast();
  const [items, setItems] = useState<ParlamentarList[]>([]);
  const [legislaturas, setLegislaturas] = useState<Legislatura[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [parl, leg] = await Promise.all([
        apiList<ParlamentarList>('/parlamentares', { limit: 100 }),
        apiList<Legislatura>('/legislaturas', { limit: 50 }),
      ]);
      setItems(parl.data);
      setLegislaturas(leg.data);
      if (selectedId && !parl.data.some((p) => p.id === selectedId)) {
        setSelectedId(null);
        setCreating(false);
        setForm(emptyForm());
      }
    } catch (err) {
      showApiError(err, 'Erro ao carregar parlamentares');
    }
  }, [selectedId, showApiError]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (creating) return;
    if (!selectedId) {
      setForm(emptyForm());
      return;
    }
    api<ParlamentarDetalhe>(`/parlamentares/${selectedId}`)
      .then((d) => setForm(detailToForm(d)))
      .catch((err) => showApiError(err));
  }, [selectedId, creating, showApiError]);

  function startCreate() {
    setSelectedId(null);
    setCreating(true);
    const f = emptyForm();
    if (legislaturas[0]) {
      f.mandatos = [emptyMandato(legislaturas[0].id)];
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
    if (!canWrite || !form.nome.trim()) return;
    setSaving(true);
    try {
      const body = buildPayload(form);
      if (creating) {
        const created = await api<ParlamentarDetalhe>('/parlamentares', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        setCreating(false);
        setSelectedId(created.id);
        showSuccess('Parlamentar cadastrado.');
      } else if (selectedId) {
        await api(`/parlamentares/${selectedId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        showSuccess('Parlamentar atualizado.');
      }
      await load();
      if (selectedId) {
        const d = await api<ParlamentarDetalhe>(`/parlamentares/${selectedId}`);
        setForm(detailToForm(d));
      }
    } catch (err) {
      showApiError(err);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, nome: string) {
    if (!confirm(`Excluir o parlamentar "${nome}"?`)) return;
    try {
      await api(`/parlamentares/${id}`, { method: 'DELETE' });
      if (selectedId === id) {
        closeDrawer();
      }
      showSuccess('Parlamentar removido.');
      await load();
    } catch (err) {
      showApiError(err);
    }
  }

  function updateMandato(clientId: string, patch: Partial<MandatoForm>) {
    setForm((f) => ({
      ...f,
      mandatos: f.mandatos.map((m) =>
        m.clientId === clientId ? { ...m, ...patch } : m,
      ),
    }));
  }

  function addMandato() {
    const defaultLeg = legislaturas[0]?.id ?? '';
    setForm((f) => ({
      ...f,
      mandatos: [...f.mandatos, emptyMandato(defaultLeg)],
    }));
  }

  function removeMandato(clientId: string) {
    setForm((f) => ({
      ...f,
      mandatos: f.mandatos.filter((m) => m.clientId !== clientId),
    }));
  }

  const editing = creating || !!selectedId;

  return (
    <>
      <PanelToolbar
        icon={MODULE_ICONS.parlamentares}
        title="Parlamentares"
        actions={
          canWrite ? (
            <button type="button" className="btn btn-primary" onClick={startCreate}>
              Adicionar parlamentar
            </button>
          ) : undefined
        }
      />

      <p className="muted" style={{ margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
        Clique em um parlamentar na tabela para abrir o cadastro no painel lateral. Dados
        pessoais, mandatos e situação na casa.
      </p>

      <div className="list-panel">
        <div className="list-panel__body">
          <div className="list-panel__scroll table-wrap">
            <table>
                <thead>
                  <tr>
                    <th>Nome parlamentar</th>
                    <th>Partido</th>
                    <th>Gabinete</th>
                    <th>Legislatura</th>
                    <th>Ativo?</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr
                      key={p.id}
                      className={selectedId === p.id && !creating ? 'row-selected' : ''}
                      onClick={() => selectRow(p.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{displayNome(p)}</td>
                      <td>{p.partido ?? '—'}</td>
                      <td>{p.gabinete ?? '—'}</td>
                      <td>
                        {p.mandatos?.[0]?.legislatura?.numero
                          ? `${p.mandatos[0].legislatura.numero}ª`
                          : '—'}
                      </td>
                      <td>{p.ativo ? 'Sim' : 'Não'}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {canWrite && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => remove(p.id, displayNome(p))}
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
                icon="pi pi-users"
                title="Nenhum parlamentar cadastrado"
                hint="Cadastre vereadores e vincule mandatos à legislatura vigente."
              />
            )}
        </div>
      </div>

      <NavDrawer
        visible={editing}
        onHide={closeDrawer}
        wide
        title={
          creating
            ? 'Novo parlamentar'
            : form.nomeParlamentar || form.nome || 'Parlamentar'
        }
        subtitle={
          creating ? 'Preencha os dados e vincule mandatos à legislatura.' : undefined
        }
      >
        <form id="parlamentar-form" onSubmit={handleSubmit} className="form-stack">
                <div className="form-section">
                  <p className="form-section__title">Identificação</p>
                  <label>
                    Nome completo *
                    <input
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      required
                      disabled={!canWrite}
                    />
                  </label>
                  <label>
                    Nome parlamentar
                    <input
                      value={form.nomeParlamentar}
                      onChange={(e) =>
                        setForm({ ...form, nomeParlamentar: e.target.value })
                      }
                      disabled={!canWrite}
                      placeholder="Como aparece em matérias e pauta"
                    />
                  </label>
                  <div className="form-grid-2">
                    <label>
                      CPF
                      <input
                        value={form.cpf}
                        onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                        disabled={!canWrite}
                      />
                    </label>
                    <label>
                      RG
                      <input
                        value={form.rg}
                        onChange={(e) => setForm({ ...form, rg: e.target.value })}
                        disabled={!canWrite}
                      />
                    </label>
                  </div>
                  <div className="form-grid-2">
                    <label>
                      Título de eleitor
                      <input
                        value={form.tituloEleitor}
                        onChange={(e) =>
                          setForm({ ...form, tituloEleitor: e.target.value })
                        }
                        disabled={!canWrite}
                      />
                    </label>
                    <label>
                      Data de nascimento
                      <input
                        type="date"
                        value={form.dataNascimento}
                        onChange={(e) =>
                          setForm({ ...form, dataNascimento: e.target.value })
                        }
                        disabled={!canWrite}
                      />
                    </label>
                  </div>
                  <label>
                    Sexo
                    <select
                      value={form.sexo}
                      onChange={(e) => setForm({ ...form, sexo: e.target.value })}
                      disabled={!canWrite}
                    >
                      {SEXO_OPCOES.map((o) => (
                        <option key={o.value || 'vazio'} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="label-inline">
                    <input
                      type="checkbox"
                      checked={form.ativo}
                      onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                      disabled={!canWrite}
                    />
                    Ativo na casa?
                  </label>
                </div>

                <div className="form-section">
                  <p className="form-section__title">Dados complementares</p>
                  <div className="form-grid-2">
                    <label>
                      Partido
                      <input
                        value={form.partido}
                        onChange={(e) => setForm({ ...form, partido: e.target.value })}
                        disabled={!canWrite}
                      />
                    </label>
                    <label>
                      N.º gabinete
                      <input
                        value={form.gabinete}
                        onChange={(e) => setForm({ ...form, gabinete: e.target.value })}
                        disabled={!canWrite}
                      />
                    </label>
                  </div>
                  <label>
                    Profissão
                    <input
                      value={form.profissao}
                      onChange={(e) => setForm({ ...form, profissao: e.target.value })}
                      disabled={!canWrite}
                    />
                  </label>
                  <div className="form-grid-2">
                    <label>
                      Situação militar
                      <select
                        value={form.situacaoMilitar}
                        onChange={(e) =>
                          setForm({ ...form, situacaoMilitar: e.target.value })
                        }
                        disabled={!canWrite}
                      >
                        {SITUACAO_MILITAR_OPCOES.map((o) => (
                          <option key={o.value || 'vazio'} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Nível de instrução
                      <select
                        value={form.nivelInstrucao}
                        onChange={(e) =>
                          setForm({ ...form, nivelInstrucao: e.target.value })
                        }
                        disabled={!canWrite}
                      >
                        {NIVEL_INSTRUCAO_OPCOES.map((o) => (
                          <option key={o.value || 'vazio'} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label>
                    URL da foto
                    <input
                      value={form.fotoUrl}
                      onChange={(e) => setForm({ ...form, fotoUrl: e.target.value })}
                      disabled={!canWrite}
                      placeholder="https://..."
                    />
                  </label>
                  <label>
                    Biografia
                    <textarea
                      rows={4}
                      value={form.biografia}
                      onChange={(e) => setForm({ ...form, biografia: e.target.value })}
                      disabled={!canWrite}
                    />
                  </label>
                </div>

                <div className="form-section">
                  <p className="form-section__title">Contato e endereço</p>
                  <div className="form-grid-2">
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
                      Site / homepage
                      <input
                        value={form.site}
                        onChange={(e) => setForm({ ...form, site: e.target.value })}
                        disabled={!canWrite}
                      />
                    </label>
                  </div>
                  <div className="form-grid-2">
                    <label>
                      Telefone
                      <input
                        value={form.telefone}
                        onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                        disabled={!canWrite}
                      />
                    </label>
                    <label>
                      Celular
                      <input
                        value={form.celular}
                        onChange={(e) => setForm({ ...form, celular: e.target.value })}
                        disabled={!canWrite}
                      />
                    </label>
                  </div>
                  <label>
                    CEP
                    <input
                      value={form.cep}
                      onChange={(e) => setForm({ ...form, cep: e.target.value })}
                      disabled={!canWrite}
                    />
                  </label>
                  <label>
                    Logradouro
                    <input
                      value={form.logradouro}
                      onChange={(e) => setForm({ ...form, logradouro: e.target.value })}
                      disabled={!canWrite}
                    />
                  </label>
                  <div className="form-grid-2">
                    <label>
                      Número
                      <input
                        value={form.numeroEndereco}
                        onChange={(e) =>
                          setForm({ ...form, numeroEndereco: e.target.value })
                        }
                        disabled={!canWrite}
                      />
                    </label>
                    <label>
                      Complemento
                      <input
                        value={form.complemento}
                        onChange={(e) =>
                          setForm({ ...form, complemento: e.target.value })
                        }
                        disabled={!canWrite}
                      />
                    </label>
                  </div>
                  <div className="form-grid-3">
                    <label>
                      Bairro
                      <input
                        value={form.bairro}
                        onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                        disabled={!canWrite}
                      />
                    </label>
                    <label>
                      Cidade
                      <input
                        value={form.cidade}
                        onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                        disabled={!canWrite}
                      />
                    </label>
                    <label>
                      UF
                      <select
                        value={form.uf}
                        onChange={(e) => setForm({ ...form, uf: e.target.value })}
                        disabled={!canWrite}
                      >
                        {UF_OPCOES.map((uf) => (
                          <option key={uf || 'vazio'} value={uf}>
                            {uf || '—'}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section__header-row">
                    <p className="form-section__title">Mandatos (legislatura)</p>
                    {canWrite && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={addMandato}
                      >
                        + Mandato
                      </button>
                    )}
                  </div>
                  {form.mandatos.length === 0 && (
                    <p className="muted" style={{ fontSize: '0.9rem' }}>
                      Nenhum mandato. Cadastre legislaturas em Legislaturas e vincule aqui.
                    </p>
                  )}
                  {form.mandatos.map((m) => (
                    <div key={m.clientId} className="mandato-card">
                      <div className="form-grid-2">
                        <label>
                          Legislatura *
                          <select
                            value={m.legislaturaId}
                            onChange={(e) =>
                              updateMandato(m.clientId, {
                                legislaturaId: e.target.value,
                              })
                            }
                            disabled={!canWrite}
                            required
                          >
                            <option value="">—</option>
                            {legislaturas.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.numero}ª legislatura
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="label-inline" style={{ alignSelf: 'end' }}>
                          <input
                            type="checkbox"
                            checked={m.titular}
                            onChange={(e) =>
                              updateMandato(m.clientId, { titular: e.target.checked })
                            }
                            disabled={!canWrite}
                          />
                          Titular
                        </label>
                      </div>
                      <div className="form-grid-3">
                        <label>
                          Data posse
                          <input
                            type="date"
                            value={m.dataPosse}
                            onChange={(e) =>
                              updateMandato(m.clientId, { dataPosse: e.target.value })
                            }
                            disabled={!canWrite}
                          />
                        </label>
                        <label>
                          Expedição diploma
                          <input
                            type="date"
                            value={m.dataExpedicaoDiploma}
                            onChange={(e) =>
                              updateMandato(m.clientId, {
                                dataExpedicaoDiploma: e.target.value,
                              })
                            }
                            disabled={!canWrite}
                          />
                        </label>
                        <label>
                          Data fim
                          <input
                            type="date"
                            value={m.dataFim}
                            onChange={(e) =>
                              updateMandato(m.clientId, { dataFim: e.target.value })
                            }
                            disabled={!canWrite}
                          />
                        </label>
                      </div>
                      <div className="mandato-card__footer">
                        <label className="label-inline">
                          <input
                            type="checkbox"
                            checked={m.ativo}
                            onChange={(e) =>
                              updateMandato(m.clientId, { ativo: e.target.checked })
                            }
                            disabled={!canWrite}
                          />
                          Mandato ativo
                        </label>
                        {canWrite && form.mandatos.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removeMandato(m.clientId)}
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <IntGestMensagemField
                  value={form.mensagem}
                  onChange={(v) => setForm({ ...form, mensagem: v })}
                />

          {canWrite && (
            <div className="detail-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving
                  ? 'Salvando…'
                  : creating
                    ? 'Criar parlamentar'
                    : 'Salvar alterações'}
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
