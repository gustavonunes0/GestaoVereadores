import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { SiglButton } from '../components/common/SiglButton';
import { DataTableLayout } from '../components/common/DataTableLayout';
import { FiltroLayout } from '../components/common/FiltroLayout';
import { materiasApi } from '../api/legislative/materias.api';
import { sessoesApi } from '../api/legislative/sessoes.api';
import { MODULE_ICONS, ROUTES } from '../app/navigation';
import { NavDrawer } from '../components/NavDrawer';
import { SessaoMensagemField } from '../components/forms/SessaoMensagemField';
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
import { SessaoStatusBadge } from '../components/sessoes/SessaoStatusBadge';
import { AbrirSessaoDialog } from '../components/sessoes/AbrirSessaoDialog';
import { EncerrarSessaoDialog } from '../components/sessoes/EncerrarSessaoDialog';
import { useLegislatura } from '../contexts/LegislaturaContext';
import type { LegislaturaRef } from '../contexts/LegislaturaContext';
import { useAppToast } from '../hooks/useAppToast';
import { useDominios } from '../hooks/useDominios';
import { usePermissions } from '../hooks/usePermissions';
import {
    canAddMateriaToPauta,
    type MateriaStatus,
    type SessaoStatus,
} from '../types/legislative';
import { buildSessaoDataRange } from '../utils/sessaoPesquisa';

type Sessao = {
    id: string;
    dataInicio: string;
    tipo?: { id?: string; nome: string; label?: string };
    situacao?: { nome: string; codigo?: string };
    statusSessao?: SessaoStatus;
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
    page: number,
): Record<string, string | number | undefined> {
    const params: Record<string, string | number | undefined> = { limit: 20, page };
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
    const { canWrite, canManageSessao, canVotar } = usePermissions();
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
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [detail, setDetail] = useState<Sessao | null>(null);
    const [dialogCriar, setDialogCriar] = useState(false);
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
    const [dialogAbrir, setDialogAbrir] = useState(false);
    const [dialogEncerrar, setDialogEncerrar] = useState(false);
    const [lifecycleBusy, setLifecycleBusy] = useState(false);

    useEffect(() => {
        setFiltrosDraft(baselineFiltros);
        setFiltrosApplied(baselineFiltros);
    }, [baselineFiltros]);

    useEffect(() => {
        void refresh().then(setLegislaturasList);
    }, [refresh]);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const r = await sessoesApi.list(filtrosToQuery(filtrosApplied, page));
            const rows = r.data as unknown as Sessao[];
            setItems(rows);
            setTotal(r.meta.total);
            if (selectedId && !rows.some((s) => s.id === selectedId)) {
                setSelectedId(null);
                setDetail(null);
            }
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [filtrosApplied, page, selectedId, showApiError]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    useEffect(() => {
        if (!selectedId) {
            setDetail(null);
            return;
        }
        sessoesApi.getById(selectedId).then((raw) => {
            const d = raw as unknown as Sessao;
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
        if (dominios && dialogCriar) {
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
    }, [dominios, dialogCriar, createTipoSessaoId, createSituacaoId]);

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

    async function handleLifecycle(action: 'suspender' | 'cancelar') {
        if (!selectedId) return;
        setLifecycleBusy(true);
        try {
            await sessoesApi[action](selectedId);
            const labels = { suspender: 'Sessão suspensa.', cancelar: 'Sessão cancelada.' };
            showSuccess(labels[action]);
            refreshDetail();
        } catch (err) {
            showApiError(err);
        } finally {
            setLifecycleBusy(false);
        }
    }

    function refreshDetail() {
        if (!selectedId) return;
        sessoesApi.getById(selectedId).then((d) => setDetail(d as unknown as Sessao));
        void buscar();
    }

    function aplicarPesquisa() {
        setPage(1);
        setFiltrosApplied({ ...filtrosDraft });
        setSelectedId(null);
        setDetail(null);
        setSearchGeneration((g) => g + 1);
    }

    function limparFiltros() {
        const v = defaultFiltros('', '');
        setPage(1);
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
            setDialogCriar(false);
            setCreateMensagem('');
            showSuccess('Sessão plenária cadastrada.');
            await buscar();
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
                status: 'EM_TRAMITACAO',
            });
            const lista = response.data as unknown as Materia[];
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

    const colunas = (
        <>
            <Column
                header="Data início"
                style={{ minWidth: '10rem' }}
                body={(s: Sessao) =>
                    new Date(s.dataInicio).toLocaleString('pt-BR')
                }
            />
            <Column
                header="Tipo"
                style={{ minWidth: '8rem' }}
                body={(s: Sessao) => s.tipo?.nome ?? '—'}
            />
            <Column
                header="Situação"
                style={{ width: '9rem' }}
                body={(s: Sessao) =>
                    s.statusSessao ? (
                        <SessaoStatusBadge status={s.statusSessao} />
                    ) : (
                        s.situacao?.nome ?? '—'
                    )
                }
            />
            <Column
                header="Legislatura"
                style={{ width: '7rem' }}
                body={(s: Sessao) =>
                    s.sessaoLegislativa?.legislatura?.numero
                        ? `${s.sessaoLegislativa.legislatura.numero}ª`
                        : '—'
                }
            />
            <Column
                header="Pauta"
                style={{ width: '5rem' }}
                body={(s: Sessao) => s.pautaItens?.length ?? 0}
            />
        </>
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.sessoes}
                title="Sessões plenárias"
                subtitle="Pesquisar, editar e deliberar sessões plenárias."
                actions={
                    <Button
                        label="Adicionar sessão plenária"
                        icon="pi pi-plus"
                        onClick={() => setDialogCriar(true)}
                    />
                }
            />

            {dominios && (
                <section aria-label="Filtros de pesquisa">
                    <FiltroLayout
                        onBuscar={aplicarPesquisa}
                        onLimpar={limparFiltros}
                        loading={loading}
                    >
                        <SessaoPesquisaFilters
                            embedded
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
                            resultCount={total}
                            searchGeneration={searchGeneration}
                        />
                    </FiltroLayout>
                </section>
            )}

            <section aria-label="Lista de sessões plenárias" className="pt-4">
                <DataTableLayout<Sessao>
                    items={items}
                    total={total}
                    loading={loading}
                    page={page}
                    onPageChange={setPage}
                    columns={colunas}
                    canWrite={canWrite}
                    onVer={(s) => setSelectedId(s.id)}
                    onEditar={canWrite ? (s) => setSelectedId(s.id) : undefined}
                />
            </section>

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

                        {canManageSessao && detail.statusSessao && (
                            <div className="sigl-cluster" style={{ marginBottom: '0.75rem' }}>
                                {detail.statusSessao === 'AGENDADA' && (
                                    <>
                                        <SiglButton
                                            label="Abrir sessão"
                                            icon="pi pi-play"
                                            onClick={() => setDialogAbrir(true)}
                                            disabled={lifecycleBusy}
                                        />
                                        <SiglButton
                                            label="Cancelar sessão"
                                            icon="pi pi-times"
                                            severity="danger"
                                            outlined
                                            onClick={() => void handleLifecycle('cancelar')}
                                            disabled={lifecycleBusy}
                                        />
                                    </>
                                )}
                                {detail.statusSessao === 'ABERTA' && (
                                    <>
                                        <SiglButton
                                            label="Suspender"
                                            icon="pi pi-pause"
                                            severity="secondary"
                                            outlined
                                            onClick={() => void handleLifecycle('suspender')}
                                            disabled={lifecycleBusy}
                                        />
                                        <SiglButton
                                            label="Encerrar sessão"
                                            icon="pi pi-stop"
                                            severity="warning"
                                            onClick={() => setDialogEncerrar(true)}
                                            disabled={lifecycleBusy}
                                        />
                                    </>
                                )}
                                {detail.statusSessao === 'SUSPENSA' && (
                                    <>
                                        <SiglButton
                                            label="Retomar"
                                            icon="pi pi-play"
                                            onClick={() => setDialogAbrir(true)}
                                            disabled={lifecycleBusy}
                                        />
                                        <SiglButton
                                            label="Encerrar sessão"
                                            icon="pi pi-stop"
                                            severity="warning"
                                            onClick={() => setDialogEncerrar(true)}
                                            disabled={lifecycleBusy}
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        <form
                            onSubmit={handleSaveDetail}
                            className="form-stack"
                        >
                            <div className="sigl-dialog-body">
                                <div className="sigl-dialog-secao">
                                    <span className="sigl-dialog-secao-titulo">Dados da sessão</span>
                                    <div className="sigl-filtro-campo">
                                        <label htmlFor="sess-edit-inicio">Data início *</label>
                                        <input
                                            id="sess-edit-inicio"
                                            type="datetime-local"
                                            value={editDataInicio}
                                            onChange={(e) => setEditDataInicio(e.target.value)}
                                            required
                                            disabled={!canWrite}
                                        />
                                    </div>
                                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                                        <div className="sigl-filtro-campo">
                                            <label htmlFor="sess-edit-tipo">Tipo *</label>
                                            <select
                                                id="sess-edit-tipo"
                                                value={editTipoSessaoId}
                                                onChange={(e) => setEditTipoSessaoId(e.target.value)}
                                                required
                                                disabled={!canWrite}
                                            >
                                                {dominios?.tiposSessao.map((t) => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.nome}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="sigl-filtro-campo">
                                            <label htmlFor="sess-edit-situacao">Situação *</label>
                                            <select
                                                id="sess-edit-situacao"
                                                value={editSituacaoId}
                                                onChange={(e) => setEditSituacaoId(e.target.value)}
                                                required
                                                disabled={!canWrite}
                                            >
                                                {dominios?.situacoesSessao.map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.nome}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="sigl-filtro-campo">
                                        <label htmlFor="sess-edit-leg">Sessão legislativa</label>
                                        <select
                                            id="sess-edit-leg"
                                            value={editSessaoLegislativaId}
                                            onChange={(e) => setEditSessaoLegislativaId(e.target.value)}
                                            disabled={!canWrite}
                                        >
                                            <option value="">—</option>
                                            {sessoesLegislativasEdit.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.numero}ª sessão legislativa
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <SessaoMensagemField
                                        value={editMensagem}
                                        onChange={setEditMensagem}
                                    />
                                    {canWrite && (
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={savingDetail}
                                        >
                                            {savingDetail ? 'Salvando…' : 'Salvar sessão'}
                                        </button>
                                    )}
                                </div>
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
                                canManageSessao={canManageSessao}
                                canVotar={canVotar}
                                sessaoEmAndamento={sessaoEmAndamento}
                                onUpdated={refreshDetail}
                            />
                        )}
                    </>
                )}
            </NavDrawer>

            {dialogCriar && dominios && (
                <Modal
                    title="Adicionar sessão plenária"
                    onClose={() => setDialogCriar(false)}
                >
                    <form onSubmit={handleCreate} className="form-stack">
                        <div className="sigl-dialog-body">
                            <div className="sigl-dialog-secao">
                                <span className="sigl-dialog-secao-titulo">Agendamento</span>
                                <div className="sigl-filtro-campo">
                                    <label htmlFor="sess-data-inicio">Data início *</label>
                                    <input
                                        id="sess-data-inicio"
                                        type="datetime-local"
                                        value={createDataInicio}
                                        onChange={(e) => setCreateDataInicio(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="sigl-dialog-secao">
                                <span className="sigl-dialog-secao-titulo">Classificação</span>
                                <div className="sigl-dialog-grid sigl-dialog-grid-2">
                                    <div className="sigl-filtro-campo">
                                        <label htmlFor="sess-tipo">Tipo *</label>
                                        <select
                                            id="sess-tipo"
                                            value={createTipoSessaoId}
                                            onChange={(e) => setCreateTipoSessaoId(e.target.value)}
                                            required
                                        >
                                            {dominios.tiposSessao.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="sigl-filtro-campo">
                                        <label htmlFor="sess-situacao">Situação *</label>
                                        <select
                                            id="sess-situacao"
                                            value={createSituacaoId}
                                            onChange={(e) => setCreateSituacaoId(e.target.value)}
                                            required
                                        >
                                            {dominios.situacoesSessao.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="sigl-dialog-secao">
                                <span className="sigl-dialog-secao-titulo">Mensagem</span>
                                <SessaoMensagemField
                                    value={createMensagem}
                                    onChange={setCreateMensagem}
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setDialogCriar(false)}
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
                        <div className="sigl-dialog-body">
                            <div className="sigl-dialog-secao">
                                <span className="sigl-dialog-secao-titulo">Pauta</span>
                                <div className="sigl-filtro-campo">
                                    <label htmlFor="pauta-materia">Matéria *</label>
                                    <select
                                        id="pauta-materia"
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
                                </div>
                                <div className="sigl-filtro-campo">
                                    <label htmlFor="pauta-ordem">Ordem na pauta *</label>
                                    <input
                                        id="pauta-ordem"
                                        type="number"
                                        min={1}
                                        value={ordemPauta}
                                        onChange={(e) => setOrdemPauta(Number(e.target.value))}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
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

            {dialogAbrir && selectedId && (
                <AbrirSessaoDialog
                    sessaoId={selectedId}
                    onClose={() => setDialogAbrir(false)}
                    onSaved={refreshDetail}
                />
            )}

            {dialogEncerrar && selectedId && (
                <EncerrarSessaoDialog
                    sessaoId={selectedId}
                    onClose={() => setDialogEncerrar(false)}
                    onSaved={refreshDetail}
                />
            )}
        </main>
    );
}
