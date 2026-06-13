import { useCallback, useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { MODULE_ICONS } from '../app/navigation';
import { api, apiList } from '../api/client';
import { SiglButton } from '../components/common/SiglButton';
import { PageHeader } from '../components/PageHeader';
import {
    NormasPesquisaFilters,
    type NormasFiltrosForm,
} from '../components/publicacao/NormasPesquisaFilters';
import { PublicacaoMetaGrid } from '../components/publicacao/PublicacaoMetaGrid';
import { PublicacaoModuleIntro } from '../components/publicacao/PublicacaoModuleIntro';
import { useAppToast } from '../hooks/useAppToast';
import { useDominios } from '../hooks/useDominios';
import { PUBLICACAO_MODULES } from '../app/publicacao';
import { WORKFLOW_PIPELINE_TOTAL } from '../app/navigation';
import { ContextBanner } from '../components/ContextBanner';
import { EmptyState } from '../components/common/EmptyState';
import { DocumentListPanel } from '../components/workflow/DocumentListPanel';
import { ModulePipelineFooter } from '../components/workflow/ModulePipelineFooter';
import { PipelineStepBadge } from '../components/workflow/PipelineStepBadge';
import { usePermissions } from '../hooks/usePermissions';
import { MATERIA_STATUS, type MateriaStatus } from '../types/legislative';
import { formatDatePt } from '../utils/formatDate';

type NormaListItem = {
    id: string;
    numero: string;
    ementa: string;
    data?: string | null;
    dataPublicacaoInicio?: string | null;
    tipo?: { nome: string };
    ano?: { valor: number };
};

type NormaDetail = NormaListItem & {
    esferaFederacao?: { nome: string };
    identificador?: { nome: string };
    materiaOrigem?: { id: string; ementa: string; status?: MateriaStatus };
    mensagem?: string | null;
};

type MateriaOption = {
    id: string;
    ementa: string;
    status?: MateriaStatus;
};

function emptyNormasFiltros(): NormasFiltrosForm {
    return { tipoId: '', anoId: '', numero: '', dataPubDe: '', dataPubAte: '' };
}

function normasFiltrosAtivos(f: NormasFiltrosForm) {
    return Boolean(
        f.tipoId || f.anoId || f.numero.trim() || f.dataPubDe || f.dataPubAte,
    );
}

function normasFiltrosToQuery(
    f: NormasFiltrosForm,
): Record<string, string | number | undefined> {
    const params: Record<string, string | number | undefined> = { limit: 100 };
    if (f.tipoId) params.tipoId = f.tipoId;
    if (f.anoId) params.anoId = f.anoId;
    if (f.numero.trim()) params.numero = f.numero.trim();
    if (f.dataPubDe)
        params.dataPublicacaoDe = new Date(f.dataPubDe).toISOString();
    if (f.dataPubAte) {
        params.dataPublicacaoAte = new Date(
            `${f.dataPubAte}T23:59:59.999`,
        ).toISOString();
    }
    return params;
}

export function NormasPage() {
    const { dominios } = useDominios();
    const { canWrite } = usePermissions();
    const { showSuccess, showApiError } = useAppToast();

    const [items, setItems] = useState<NormaListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [filtrosDraft, setFiltrosDraft] =
        useState<NormasFiltrosForm>(emptyNormasFiltros);
    const [filtrosApplied, setFiltrosApplied] =
        useState<NormasFiltrosForm>(emptyNormasFiltros);
    const [searchGeneration, setSearchGeneration] = useState(0);

    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [numero, setNumero] = useState('');
    const [ementa, setEmenta] = useState('');
    const [tipoId, setTipoId] = useState('');
    const [materiaOrigemId, setMateriaOrigemId] = useState<string | null>(null);
    const [materiasAprovadas, setMateriasAprovadas] = useState<MateriaOption[]>(
        [],
    );

    const [detailOpen, setDetailOpen] = useState(false);
    const [detail, setDetail] = useState<NormaDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const hasFilters = normasFiltrosAtivos(filtrosApplied);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiList<NormaListItem>(
                '/normas',
                normasFiltrosToQuery(filtrosApplied),
            );
            setItems(response.data);
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [filtrosApplied, showApiError]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        if (dominios?.tiposNorma[0] && !tipoId)
            setTipoId(dominios.tiposNorma[0].id);
    }, [dominios, tipoId]);

    function aplicarPesquisa() {
        setFiltrosApplied({ ...filtrosDraft });
        setSearchGeneration((g) => g + 1);
    }

    function clearFilters() {
        const v = emptyNormasFiltros();
        setFiltrosDraft(v);
        setFiltrosApplied(v);
        setSearchGeneration((g) => g + 1);
    }

    async function openCreateDialog() {
        try {
            const response = await apiList<MateriaOption>(
                '/legislative/materias',
                {
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
            showSuccess('Norma jurídica registrada na publicação oficial.');
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
            const data = await api<NormaDetail>(`/normas/${id}`);
            setDetail(data);
        } catch (err) {
            showApiError(err);
            setDetailOpen(false);
        } finally {
            setDetailLoading(false);
        }
    }

    const ementaBody = (row: NormaListItem) => (
        <span className="publicacao-ementa-cell" title={row.ementa}>
            {row.ementa}
        </span>
    );

    const tipoBody = (row: NormaListItem) => (
        <span className="badge-species">{row.tipo?.nome ?? '—'}</span>
    );

    const mod = PUBLICACAO_MODULES.normas;

    return (
        <section className="page page--normas">
            <PipelineStepBadge
                step={mod.pipelineStep}
                total={WORKFLOW_PIPELINE_TOTAL}
                label={mod.title}
                domain="normative"
            />

            <PageHeader
                icon={MODULE_ICONS.normas}
                title="Normas jurídicas"
                subtitle="Leis, resoluções, decretos legislativos e demais normas oficiais que regulamentam a atuação legislativa."
                actions={
                    canWrite ? (
                        <SiglButton
                            label="Registrar norma"
                            icon="pi pi-plus"
                            onClick={() => void openCreateDialog()}
                        />
                    ) : undefined
                }
            />

            <ContextBanner
                step="Etapa 4 · Normas"
                hint="Vincule normas apenas a matérias com status APROVADA na legislatura em exercício."
            />

            <PublicacaoModuleIntro moduleId="normas" />

            <DocumentListPanel
                title={mod.listPanelTitle}
                description={mod.listPanelDesc}
            >
                {dominios && (
                    <NormasPesquisaFilters
                        filtros={filtrosDraft}
                        onChange={(patch) =>
                            setFiltrosDraft((f) => ({ ...f, ...patch }))
                        }
                        tiposNorma={dominios.tiposNorma}
                        anos={dominios.anos}
                        onPesquisar={aplicarPesquisa}
                        onClear={clearFilters}
                        hasFilters={hasFilters}
                        resultCount={items.length}
                        searchGeneration={searchGeneration}
                    />
                )}

                {!loading && items.length === 0 ? (
                    <EmptyState
                        icon="pi pi-file"
                        title={
                            hasFilters
                                ? 'Nenhuma norma encontrada com os filtros aplicados'
                                : 'Nenhuma norma jurídica registrada'
                        }
                        hint={
                            hasFilters
                                ? 'Ajuste espécie, ano ou número e tente novamente.'
                                : 'Registre a norma a partir de uma matéria com status APROVADA.'
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
                        onRowClick={(e) =>
                            void openDetail((e.data as NormaListItem).id)
                        }
                    >
                        <Column
                            header="Espécie"
                            body={tipoBody}
                            style={{ width: '11rem' }}
                        />
                        <Column
                            field="numero"
                            header="Número"
                            sortable
                            style={{ width: '6rem' }}
                        />
                        <Column
                            header="Ano"
                            body={(row: NormaListItem) => row.ano?.valor ?? '—'}
                            style={{ width: '4.5rem' }}
                        />
                        <Column header="Ementa" body={ementaBody} />
                        <Column
                            header="Publicação"
                            body={(row: NormaListItem) =>
                                formatDatePt(
                                    row.dataPublicacaoInicio ?? row.data,
                                )
                            }
                            style={{ width: '7rem' }}
                        />
                    </DataTable>
                )}
            </DocumentListPanel>

            <Dialog
                header="Detalhe da norma jurídica"
                visible={detailOpen}
                onHide={() => setDetailOpen(false)}
                modal
                className="sigl-dialog-md"
                footer={
                    <div className="dialog-footer">
                        <SiglButton
                            label="Fechar"
                            severity="secondary"
                            onClick={() => setDetailOpen(false)}
                        />
                    </div>
                }
            >
                {detailLoading && (
                    <p className="ui-loading-inline">Carregando norma…</p>
                )}
                {detail && !detailLoading && (
                    <div className="publicacao-detail">
                        <span className="badge-species publicacao-detail__tag">
                            {detail.tipo?.nome ?? 'Norma'}
                        </span>
                        <p className="publicacao-detail__ementa">
                            {detail.ementa}
                        </p>
                        <PublicacaoMetaGrid
                            items={[
                                { label: 'Número', value: detail.numero },
                                {
                                    label: 'Ano',
                                    value: detail.ano?.valor ?? '—',
                                },
                                {
                                    label: 'Data da norma',
                                    value: formatDatePt(detail.data),
                                },
                                {
                                    label: 'Publicação',
                                    value: formatDatePt(
                                        detail.dataPublicacaoInicio,
                                    ),
                                },
                                {
                                    label: 'Esfera',
                                    value: detail.esferaFederacao?.nome,
                                },
                                {
                                    label: 'Identificador',
                                    value: detail.identificador?.nome,
                                },
                                {
                                    label: 'Matéria de origem',
                                    value:
                                        detail.materiaOrigem?.ementa ??
                                        'Sem vínculo',
                                },
                            ]}
                        />
                        {detail.mensagem && (
                            <p className="field-hint">
                                <strong>Observação:</strong> {detail.mensagem}
                            </p>
                        )}
                    </div>
                )}
            </Dialog>

            <Dialog
                header="Registrar norma jurídica"
                visible={open && !!dominios}
                onHide={() => !saving && setOpen(false)}
                modal
                className="sigl-dialog-md"
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
                            label="Publicar norma"
                            icon="pi pi-check"
                            loading={saving}
                            onClick={() => void handleCreate()}
                        />
                    </div>
                }
            >
                {dominios && (
                    <div className="form-stack">
                        <div className="form-section">
                            <p className="form-section__title">
                                Identificação normativa
                            </p>
                            <label
                                htmlFor="norma-tipo"
                                className="field-required"
                            >
                                Espécie normativa
                            </label>
                            <Dropdown
                                id="norma-tipo"
                                value={tipoId}
                                options={dominios.tiposNorma}
                                optionLabel="nome"
                                optionValue="id"
                                onChange={(e) => setTipoId(e.value)}
                                className="w-full"
                            />
                            <label
                                htmlFor="norma-numero"
                                className="field-required"
                            >
                                Número
                            </label>
                            <InputText
                                id="norma-numero"
                                value={numero}
                                onChange={(e) => setNumero(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="form-section">
                            <p className="form-section__title">
                                Conteúdo e origem legislativa
                            </p>
                            <label
                                htmlFor="norma-ementa"
                                className="field-required"
                            >
                                Ementa
                            </label>
                            <InputTextarea
                                id="norma-ementa"
                                value={ementa}
                                onChange={(e) => setEmenta(e.target.value)}
                                rows={4}
                                className="w-full"
                                placeholder="Resumo do objeto e alcance da norma"
                            />
                            <label htmlFor="norma-materia">
                                Matéria de origem (aprovada)
                            </label>
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
                                        : 'Nenhuma matéria aprovada'
                                }
                                disabled={!materiasAprovadas.length}
                                className="w-full"
                            />
                            {!materiasAprovadas.length && (
                                <Message
                                    severity="warn"
                                    text="Aprove uma matéria em tramitação antes de publicar a norma."
                                />
                            )}
                        </div>
                    </div>
                )}
            </Dialog>

            <ModulePipelineFooter current="normas" />
        </section>
    );
}
