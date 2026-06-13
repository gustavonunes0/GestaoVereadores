import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiglButton } from '../components/common/SiglButton';
import { materiasApi } from '../api/legislative/materias.api';
import { sessoesApi } from '../api/legislative/sessoes.api';
import { MODULE_ICONS, ROUTES } from '../app/navigation';
import { NavDrawer } from '../components/NavDrawer';
import { ContextBanner } from '../components/ContextBanner';
import { IntGestMensagemField } from '../components/forms/IntGestMensagemField';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import {
    SessaoPesquisaFilters,
    type SessaoFiltrosForm,
} from '../components/sessoes/SessaoPesquisaFilters';
import {
    SessaoDeliberacaoPanel,
    type PautaItemDeliberacao,
} from '../components/sessoes/SessaoDeliberacaoPanel';
import { useLegislatura } from '../contexts/LegislaturaContext';
import type { LegislaturaRef } from '../contexts/LegislaturaContext';
import { useAppToast } from '../hooks/useAppToast';
import { useDominios } from '../hooks/useDominios';
import { usePermissions } from '../hooks/usePermissions';
import {
    canAddMateriaToPauta,
    MATERIA_STATUS,
    type MateriaStatus,
} from '../types/legislative';
import { buildSessaoDataRange } from '../utils/sessaoPesquisa';

type Sessao = {
    id: string;
    dataInicio: string;
    tipo?: { id?: string; nome: string; label?: string };
    situacao?: { nome: string; codigo?: string };
    mensagem?: string;
    sessaoLegislativaId?: string | null;
    sessaoLegislativa?: {
        id?: string;
        numero: number;
        legislatura?: { numero: number };
    };
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

function sessaoAceitaPauta(situacao?: {
    nome: string;
    codigo?: string;
}): boolean {
    if (situacao?.codigo === 'EM_ANDAMENTO') return true;
    const nome = situacao?.nome?.toLowerCase() ?? '';
    return nome.includes('andamento');
}

function toDateTimeLocal(iso?: string) {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultFiltros(
    legislaturaId: string,
    sessaoLegislativaId: string,
): SessaoFiltrosForm {
    return {
        legislaturaId,
        sessaoLegislativaId,
        ano: String(new Date().getFullYear()),
        mes: '',
        dia: '',
        dataDe: '',
        dataAte: '',
        tipoSessaoId: '',
        situacaoId: '',
    };
}

function filtrosToQuery(
    f: SessaoFiltrosForm,
): Record<string, string | number | undefined> {
    const params: Record<string, string | number | undefined> = { limit: 100 };
    if (f.legislaturaId) params.legislaturaId = f.legislaturaId;
    if (f.sessaoLegislativaId)
        params.sessaoLegislativaId = f.sessaoLegislativaId;
    if (f.tipoSessaoId) params.tipoSessaoId = f.tipoSessaoId;
    if (f.situacaoId) params.situacaoId = f.situacaoId;
    const range = buildSessaoDataRange({
        ano: f.ano ? Number(f.ano) : undefined,
        mes: f.mes ? Number(f.mes) : undefined,
        dia: f.dia ? Number(f.dia) : undefined,
        dataDe: f.dataDe || undefined,
        dataAte: f.dataAte || undefined,
    });
    if (range.dataInicioDe) params.dataInicioDe = range.dataInicioDe;
    if (range.dataInicioAte) params.dataInicioAte = range.dataInicioAte;
    return params;
}

function hasActiveFilters(f: SessaoFiltrosForm, baseline: SessaoFiltrosForm) {
    return JSON.stringify(f) !== JSON.stringify(baseline);
}

export function SessoesPage() {
    const { dominios } = useDominios();
    const { canWrite } = usePermissions();
    const { showApiError, showSuccess } = useAppToast();
    const { legislaturaId, legislaturas, refresh } = useLegislatura();

    const baselineFiltros = useMemo(
        () => defaultFiltros(legislaturaId, ''),
        [legislaturaId],
    );

    const [filtrosDraft, setFiltrosDraft] =
        useState<SessaoFiltrosForm>(baselineFiltros);
    const [filtrosApplied, setFiltrosApplied] =
        useState<SessaoFiltrosForm>(baselineFiltros);
    const [legislaturasList, setLegislaturasList] = useState<LegislaturaRef[]>(
        [],
    );
    const [items, setItems] = useState<Sessao[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [detail, setDetail] = useState<Sessao | null>(null);
    const [open, setOpen] = useState(false);
    const [pautaOpen, setPautaOpen] = useState(false);
    const [materias, setMaterias] = useState<Materia[]>([]);
    const [savingDetail, setSavingDetail] = useState(false);

    const [editDataInicio, setEditDataInicio] = useState('');
    const [editTipoSessaoId, setEditTipoSessaoId] = useState('');
    const [editSituacaoId, setEditSituacaoId] = useState('');
    const [editSessaoLegislativaId, setEditSessaoLegislativaId] = useState('');
    const [editMensagem, setEditMensagem] = useState('');

    const [createDataInicio, setCreateDataInicio] = useState('');
    const [createTipoSessaoId, setCreateTipoSessaoId] = useState('');
    const [createSituacaoId, setCreateSituacaoId] = useState('');
    const [createMensagem, setCreateMensagem] = useState('');

    const [materiaId, setMateriaId] = useState('');
    const [ordemPauta, setOrdemPauta] = useState(1);
    const [searchGeneration, setSearchGeneration] = useState(0);

    useEffect(() => {
        setFiltrosDraft(baselineFiltros);
        setFiltrosApplied(baselineFiltros);
    }, [baselineFiltros]);

    useEffect(() => {
        void refresh().then(setLegislaturasList);
    }, [refresh]);

    const load = useCallback(() => {
        return sessoesApi.list(filtrosToQuery(filtrosApplied)).then(
            (r) => {
                const rows = r.data as Sessao[];
                setItems(rows);
                if (selectedId && !rows.some((s) => s.id === selectedId)) {
                    setSelectedId(null);
                    setDetail(null);
                }
            },
        );
    }, [filtrosApplied, selectedId]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        if (!selectedId) {
            setDetail(null);
            return;
        }
        sessoesApi.getById(selectedId).then((raw) => {
            const d = raw as Sessao;
            setDetail(d);
            setEditDataInicio(toDateTimeLocal(d.dataInicio));
            setEditMensagem(d.mensagem ?? '');
            setEditSessaoLegislativaId(
                d.sessaoLegislativaId ??
                    d.sessaoLegislativa?.id ??
                    '',
            );
            if (dominios) {
                const tipo = dominios.tiposSessao.find(
                    (t) => t.nome === d.tipo?.nome,
                );
                const sit = dominios.situacoesSessao.find(
                    (s) => s.nome === d.situacao?.nome,
                );
                setEditTipoSessaoId(
                    tipo?.id ?? dominios.tiposSessao[0]?.id ?? '',
                );
                setEditSituacaoId(
                    sit?.id ?? dominios.situacoesSessao[0]?.id ?? '',
                );
            }
        });
    }, [selectedId, dominios]);

    useEffect(() => {
        if (dominios && open) {
            if (!createTipoSessaoId && dominios.tiposSessao[0]) {
                setCreateTipoSessaoId(dominios.tiposSessao[0].id);
            }
            if (!createSituacaoId && dominios.situacoesSessao[0]) {
                const agendada =
                    dominios.situacoesSessao.find(
                        (s) => s.codigo === 'AGENDADA',
                    ) ?? dominios.situacoesSessao[0];
                setCreateSituacaoId(agendada.id);
            }
        }
    }, [dominios, open, createTipoSessaoId, createSituacaoId]);

    const sessaoEmAndamento = useMemo(
        () => !!detail && sessaoAceitaPauta(detail.situacao),
        [detail],
    );

    const podeIncluirPauta = useMemo(
        () => sessaoEmAndamento && canWrite,
        [sessaoEmAndamento, canWrite],
    );

    /** Sessões legislativas legadas — sem endpoint no modelo novo de legislaturas. */
    const sessoesLegislativasEdit = useMemo(() => [] as { id: string; numero: number }[], []);

    function refreshDetail() {
        if (!selectedId) return;
        sessoesApi.getById(selectedId).then((d) => setDetail(d as Sessao));
        void load();
    }

    function aplicarPesquisa() {
        setFiltrosApplied({ ...filtrosDraft });
        setSelectedId(null);
        setDetail(null);
        setSearchGeneration((g) => g + 1);
    }

    function limparFiltros() {
        const v = defaultFiltros('', '');
        setFiltrosDraft(v);
        setFiltrosApplied(v);
        setSelectedId(null);
        setDetail(null);
    }

    function closeDrawer() {
        setSelectedId(null);
        setDetail(null);
    }

    function novaPesquisa() {
        closeDrawer();
    }

    async function handleSaveDetail(e: FormEvent) {
        e.preventDefault();
        if (!selectedId || !canWrite) return;
        setSavingDetail(true);
        try {
            await sessoesApi.update(selectedId, {
                dataInicio: new Date(editDataInicio).toISOString(),
                tipoSessaoId: editTipoSessaoId,
                situacaoId: editSituacaoId,
                sessaoLegislativaId: editSessaoLegislativaId || undefined,
                mensagem: editMensagem.trim() || undefined,
            });
            showSuccess('Sessão atualizada.');
            refreshDetail();
        } catch (err) {
            showApiError(err);
        } finally {
            setSavingDetail(false);
        }
    }

    async function handleCreate(e: FormEvent) {
        e.preventDefault();
        try {
            await sessoesApi.create({
                dataInicio: new Date(createDataInicio).toISOString(),
                tipoSessaoId: createTipoSessaoId,
                situacaoId: createSituacaoId,
                sessaoLegislativaId:
                    filtrosApplied.sessaoLegislativaId || undefined,
                mensagem: createMensagem.trim() || undefined,
            });
            setOpen(false);
            setCreateMensagem('');
            showSuccess('Sessão plenária cadastrada.');
            await load();
        } catch (err) {
            showApiError(err);
        }
    }

    async function handleAddPauta(e: FormEvent) {
        e.preventDefault();
        if (!selectedId || !podeIncluirPauta) return;
        try {
            await sessoesApi.addPautaItem(selectedId, {
                materiaId,
                ordem: ordemPauta,
            });
            setPautaOpen(false);
            showSuccess('Matéria incluída na pauta.');
            refreshDetail();
        } catch (err) {
            showApiError(err);
        }
    }

    async function openPautaModal() {
        if (!podeIncluirPauta) return;
        try {
            const response = await materiasApi.list({
                limit: 100,
                status: MATERIA_STATUS.EM_TRAMITACAO,
            });
            const lista = response.data as Materia[];
            const elegiveis = lista.filter((m) => canAddMateriaToPauta(m));
            setMaterias(elegiveis);
            if (elegiveis[0]) setMateriaId(elegiveis[0].id);
            setOrdemPauta((detail?.pautaItens?.length ?? 0) + 1);
            setPautaOpen(true);
        } catch (err) {
            showApiError(err);
        }
    }

    const filterActive = hasActiveFilters(
        filtrosApplied,
        defaultFiltros('', ''),
    );

    return (
        <section className="page">
            <PageHeader
                icon={MODULE_ICONS.sessoes}
                title="Sessões plenárias"
                subtitle="Pesquisar, editar e deliberar sessões (fluxo SIGL / IntGest)."
                actions={
                    canWrite ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setOpen(true)}
                        >
                            Adicionar sessão plenária
                        </button>
                    ) : undefined
                }
            />

            <ContextBanner
                step="Etapa 3"
                hint="Use os filtros como em pesquisar-sessao no IntGest; depois abra a sessão para pauta e presenças."
            />

            {dominios && (
                <SessaoPesquisaFilters
                    filtros={filtrosDraft}
                    onChange={(patch) =>
                        setFiltrosDraft((f) => ({ ...f, ...patch }))
                    }
                    legislaturas={
                        legislaturasList.length
                            ? legislaturasList
                            : legislaturas
                    }
                    tiposSessao={dominios.tiposSessao}
                    situacoesSessao={dominios.situacoesSessao}
                    onPesquisar={aplicarPesquisa}
                    onClear={limparFiltros}
                    hasFilters={filterActive}
                    resultCount={items.length}
                    searchGeneration={searchGeneration}
                />
            )}

            <div className="list-panel">
                <div className="list-panel__body">
                    <div className="list-panel__scroll table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Data início</th>
                                    <th>Tipo</th>
                                    <th>Situação</th>
                                    <th>Legislatura</th>
                                    <th>Pauta</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((s) => (
                                    <tr
                                        key={s.id}
                                        className={
                                            selectedId === s.id
                                                ? 'row-selected'
                                                : ''
                                        }
                                        onClick={() => setSelectedId(s.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td>
                                            {new Date(
                                                s.dataInicio,
                                            ).toLocaleString('pt-BR')}
                                        </td>
                                        <td>{s.tipo?.nome ?? '—'}</td>
                                        <td>{s.situacao?.nome ?? '—'}</td>
                                        <td>
                                            {s.sessaoLegislativa?.legislatura
                                                ?.numero
                                                ? `${s.sessaoLegislativa.legislatura.numero}ª`
                                                : '—'}
                                        </td>
                                        <td>{s.pautaItens?.length ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {items.length === 0 && (
                        <p className="table-empty-state">
                            {filterActive
                                ? 'Nenhuma sessão com os filtros aplicados.'
                                : 'Nenhuma sessão cadastrada. Clique em Adicionar sessão plenária.'}
                        </p>
                    )}
                </div>
            </div>

            <NavDrawer
                visible={!!detail}
                onHide={closeDrawer}
                wide
                title={
                    detail
                        ? `Sessão — ${new Date(detail.dataInicio).toLocaleString('pt-BR')}`
                        : 'Sessão plenária'
                }
                subtitle={detail?.situacao?.nome}
            >
                {detail && (
                    <>
                        <div
                            className="detail-actions sigl-cluster"
                            style={{ marginBottom: '0.75rem' }}
                        >
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={novaPesquisa}
                            >
                                Fazer nova pesquisa
                            </button>
                            {canWrite && (
                                <SiglButton
                                    label="Incluir na pauta"
                                    icon="pi pi-list"
                                    disabled={!podeIncluirPauta}
                                    onClick={() => void openPautaModal()}
                                />
                            )}
                            <Link to={ROUTES.materias}>
                                <SiglButton
                                    label="Ver matérias"
                                    icon="pi pi-file"
                                    severity="secondary"
                                    outlined
                                />
                            </Link>
                        </div>

                        <form
                            onSubmit={handleSaveDetail}
                            className="form-stack"
                        >
                            <div className="form-section">
                                <p className="form-section__title">
                                    Dados da sessão
                                </p>
                                <label>
                                    Data início *
                                    <input
                                        type="datetime-local"
                                        value={editDataInicio}
                                        onChange={(e) =>
                                            setEditDataInicio(e.target.value)
                                        }
                                        required
                                        disabled={!canWrite}
                                    />
                                </label>
                                <div className="form-grid-2">
                                    <label>
                                        Tipo *
                                        <select
                                            value={editTipoSessaoId}
                                            onChange={(e) =>
                                                setEditTipoSessaoId(
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            disabled={!canWrite}
                                        >
                                            {dominios?.tiposSessao.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label>
                                        Situação *
                                        <select
                                            value={editSituacaoId}
                                            onChange={(e) =>
                                                setEditSituacaoId(
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            disabled={!canWrite}
                                        >
                                            {dominios?.situacoesSessao.map(
                                                (s) => (
                                                    <option
                                                        key={s.id}
                                                        value={s.id}
                                                    >
                                                        {s.nome}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </label>
                                </div>
                                <label>
                                    Sessão legislativa
                                    <select
                                        value={editSessaoLegislativaId}
                                        onChange={(e) =>
                                            setEditSessaoLegislativaId(
                                                e.target.value,
                                            )
                                        }
                                        disabled={!canWrite}
                                    >
                                        <option value="">—</option>
                                        {sessoesLegislativasEdit.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.numero}ª sessão legislativa
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <IntGestMensagemField
                                    value={editMensagem}
                                    onChange={setEditMensagem}
                                />
                                {canWrite && (
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={savingDetail}
                                    >
                                        {savingDetail
                                            ? 'Salvando…'
                                            : 'Salvar sessão'}
                                    </button>
                                )}
                            </div>
                        </form>

                        <h3 className="detail-subtitle">
                            Pauta, presenças e votação
                        </h3>
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
                )}
            </NavDrawer>

            {open && dominios && (
                <Modal
                    title="Adicionar sessão plenária"
                    onClose={() => setOpen(false)}
                >
                    <form onSubmit={handleCreate} className="form-stack">
                        <label>
                            Data início *
                            <input
                                type="datetime-local"
                                value={createDataInicio}
                                onChange={(e) =>
                                    setCreateDataInicio(e.target.value)
                                }
                                required
                            />
                        </label>
                        <div className="form-grid-2">
                            <label>
                                Tipo *
                                <select
                                    value={createTipoSessaoId}
                                    onChange={(e) =>
                                        setCreateTipoSessaoId(e.target.value)
                                    }
                                    required
                                >
                                    {dominios.tiposSessao.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.nome}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Situação *
                                <select
                                    value={createSituacaoId}
                                    onChange={(e) =>
                                        setCreateSituacaoId(e.target.value)
                                    }
                                    required
                                >
                                    {dominios.situacoesSessao.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.nome}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <IntGestMensagemField
                            value={createMensagem}
                            onChange={setCreateMensagem}
                        />
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setOpen(false)}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Salvar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {pautaOpen && (
                <Modal
                    title="Incluir matéria na pauta"
                    onClose={() => setPautaOpen(false)}
                >
                    <form onSubmit={handleAddPauta} className="form-stack">
                        <label>
                            Matéria *
                            <select
                                value={materiaId}
                                onChange={(e) => setMateriaId(e.target.value)}
                                required
                            >
                                {!materias.length && (
                                    <option value="">
                                        Nenhuma matéria em tramitação disponível
                                    </option>
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
                                onChange={(e) =>
                                    setOrdemPauta(Number(e.target.value))
                                }
                                required
                            />
                        </label>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setPautaOpen(false)}
                            >
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
