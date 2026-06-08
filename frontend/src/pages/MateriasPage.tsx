import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiglButton } from '../components/common/SiglButton';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { MultiSelect } from 'primereact/multiselect';
import { SelectButton } from 'primereact/selectbutton';
import { Tag } from 'primereact/tag';
import { api, apiList } from '../api/client';
import { MODULE_ICONS } from '../app/navigation';
import { ContextBanner } from '../components/ContextBanner';
import { IntGestMensagemField } from '../components/forms/IntGestMensagemField';
import { PageHeader } from '../components/PageHeader';
import { useAppToast } from '../hooks/useAppToast';
import { useDominios } from '../hooks/useDominios';
import { usePermissions } from '../hooks/usePermissions';
import {
    isTipoProjetoLei,
    nomeEhProjetoLei,
    tipoPermiteMultiplosRepresentantes,
} from '../utils/materiaTipo';
import {
    MATERIA_STATUS,
    MATERIA_STATUS_LABELS,
    type MateriaStatus,
} from '../types/legislative';

type ParlamentarOpt = {
    id: string;
    pessoa: { nome: string };
};

type Materia = {
    id: string;
    ementa: string;
    numero?: number;
    emTramitacao: boolean;
    status?: MateriaStatus;
    tipo?: { nome: string };
    statusTramitacao?: { nome: string };
    autor?: { nome: string };
    primeiroAutor?: { pessoa?: { nome: string } };
    relator?: { pessoa?: { nome: string } };
    representantes?: { parlamentar?: { pessoa?: { nome: string } } }[];
    coautores?: { parlamentar?: { pessoa?: { nome: string } } }[];
};

const TRAMITACAO_FILTER_OPTIONS = [
    { label: 'Todas', value: 'todas' },
    { label: 'Em tramitação', value: 'sim' },
    { label: 'Encerradas', value: 'nao' },
] as const;

const emptyOption = { id: '', nome: '—' };

export function MateriasPage() {
    const { dominios } = useDominios();
    const { canWrite } = usePermissions();
    const { showSuccess, showApiError } = useAppToast();

    const [items, setItems] = useState<Materia[]>([]);
    const [loading, setLoading] = useState(false);
    const [filtroTramitacao, setFiltroTramitacao] = useState<
        'todas' | 'sim' | 'nao'
    >('todas');
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [parlamentares, setParlamentares] = useState<ParlamentarOpt[]>([]);
    const [autores, setAutores] = useState<{ id: string; nome: string }[]>([]);

    const [tipoId, setTipoId] = useState('');
    const [ementa, setEmenta] = useState('');
    const [numero, setNumero] = useState('');
    const [numeroProtocolo, setNumeroProtocolo] = useState('');
    const [anoId, setAnoId] = useState('');
    const [tematicaId, setTematicaId] = useState('');
    const [origemId, setOrigemId] = useState('');
    const [tipoListagemId, setTipoListagemId] = useState('');
    const [dataApresentacao, setDataApresentacao] = useState('');
    const [autorId, setAutorId] = useState('');
    const [relatorId, setRelatorId] = useState('');
    const [localOrigemExternaId, setLocalOrigemExternaId] = useState('');
    const [unidadeTramitacaoId, setUnidadeTramitacaoId] = useState('');
    const [statusId, setStatusId] = useState('');
    const [representanteIds, setRepresentanteIds] = useState<string[]>([]);
    const [autorParlamentarId, setAutorParlamentarId] = useState('');
    const [coautorIds, setCoautorIds] = useState<string[]>([]);
    const [mensagem, setMensagem] = useState('');

    const permiteRepresentantes = useMemo(
        () =>
            dominios
                ? tipoPermiteMultiplosRepresentantes(
                      tipoId,
                      dominios.tiposMateria,
                  )
                : false,
        [tipoId, dominios],
    );

    const isProjetoLei = useMemo(
        () =>
            dominios ? isTipoProjetoLei(tipoId, dominios.tiposMateria) : false,
        [tipoId, dominios],
    );

    const parlOptions = useMemo(
        () =>
            parlamentares.map((p) => ({
                id: p.id,
                nome: p.pessoa?.nome ?? '—',
            })),
        [parlamentares],
    );

    const load = useCallback(async () => {
        setLoading(true);
        const params: Record<string, string | number | boolean | undefined> = {
            limit: 100,
        };
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
        if (!open) return;
        apiList<ParlamentarOpt>('/parlamentares', { limit: 100 }).then((r) =>
            setParlamentares(r.data),
        );
        apiList<{ id: string; nome: string }>('/autores', { limit: 100 }).then(
            (r) => {
                setAutores(r.data);
                if (r.data[0] && !autorId) setAutorId(r.data[0].id);
            },
        );
    }, [open, autorId]);

    function resetForm() {
        setEmenta('');
        setNumero('');
        setNumeroProtocolo('');
        setAnoId('');
        setTematicaId('');
        setOrigemId('');
        setTipoListagemId('');
        setDataApresentacao('');
        setAutorId(autores[0]?.id ?? '');
        setRelatorId('');
        setLocalOrigemExternaId('');
        setUnidadeTramitacaoId('');
        setStatusId('');
        setRepresentanteIds([]);
        setAutorParlamentarId('');
        setCoautorIds([]);
        setMensagem('');
    }

    async function handleCreate() {
        if (!ementa.trim() || !tipoId) return;
        if (permiteRepresentantes && representanteIds.length === 0) {
            showApiError(
                new Error(
                    'Selecione ao menos um representante para Moção ou Requerimento.',
                ),
            );
            return;
        }
        if (isProjetoLei && !autorParlamentarId) {
            showApiError(new Error('Projeto de Lei exige o autor (vereador).'));
            return;
        }
        setSaving(true);
        try {
            const base = {
                ementa: ementa.trim(),
                tipoId,
                numero: numero ? Number(numero) : undefined,
                numeroProtocolo: numeroProtocolo
                    ? Number(numeroProtocolo)
                    : undefined,
                anoId: anoId || undefined,
                tematicaId: tematicaId || undefined,
                origemId: origemId || undefined,
                tipoListagemId: tipoListagemId || undefined,
                dataApresentacaoInicio: dataApresentacao
                    ? new Date(dataApresentacao).toISOString()
                    : undefined,
                localOrigemExternaId: localOrigemExternaId || undefined,
                unidadeTramitacaoDestinoId: unidadeTramitacaoId || undefined,
                statusTramitacaoId: statusId || undefined,
                mensagem: mensagem.trim() || undefined,
                status: MATERIA_STATUS.EM_TRAMITACAO,
                emTramitacao: true,
            };

            await api('/materias', {
                method: 'POST',
                body: JSON.stringify(
                    isProjetoLei
                        ? {
                              ...base,
                              primeiroAutorId: autorParlamentarId,
                              coautorIds: coautorIds.length
                                  ? coautorIds
                                  : undefined,
                              relatorId: relatorId || undefined,
                          }
                        : {
                              ...base,
                              autorId: autorId || undefined,
                              relatorId: relatorId || undefined,
                              representanteIds: representanteIds.length
                                  ? representanteIds
                                  : undefined,
                          },
                ),
            });
            setOpen(false);
            resetForm();
            showSuccess(
                'Matéria protocolada. Inclua na pauta em Sessões quando a sessão estiver em andamento.',
            );
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
                : row.status === MATERIA_STATUS.EM_TRAMITACAO ||
                    row.emTramitacao
                  ? 'info'
                  : 'secondary';
        return <Tag value={label} severity={severity} />;
    };

    const autoriaBody = (row: Materia) => {
        if (row.tipo?.nome && nomeEhProjetoLei(row.tipo.nome)) {
            const autor = row.primeiroAutor?.pessoa?.nome ?? '—';
            const coaut =
                row.coautores
                    ?.map((c) => c.parlamentar?.pessoa?.nome)
                    .filter(Boolean)
                    .join(', ') || '—';
            const rel = row.relator?.pessoa?.nome ?? '—';
            return `Autor: ${autor} | Coaut.: ${coaut} | Rel.: ${rel}`;
        }
        const reps =
            row.representantes
                ?.map((r) => r.parlamentar?.pessoa?.nome)
                .filter(Boolean)
                .join(', ') ?? '';
        if (reps) return reps;
        return row.autor?.nome ?? row.primeiroAutor?.pessoa?.nome ?? '—';
    };

    return (
        <section className="page">
            <PageHeader
                icon={MODULE_ICONS.materias}
                title="Matérias e proposições"
                subtitle="Projeto de Lei: autor, coautor e relator. Moção/Requerimento: representantes."
                actions={
                    canWrite ? (
                        <SiglButton
                            label="Nova matéria"
                            icon="pi pi-plus"
                            onClick={() => setOpen(true)}
                        />
                    ) : undefined
                }
            />

            <ContextBanner
                step="Matérias"
                hint="PL com autor obrigatório, coautores opcionais e relator. Moção/Requerimento com representantes."
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
                        <SiglButton
                            label="Ir para sessões"
                            icon="pi pi-arrow-right"
                            severity="secondary"
                            text
                        />
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
                <Column
                    header="Nº"
                    body={(row: Materia) => row.numero ?? '—'}
                    style={{ width: '4rem' }}
                />
                <Column
                    header="Tipo"
                    body={(row: Materia) => row.tipo?.nome ?? '—'}
                />
                <Column header="Ementa" body={(row: Materia) => row.ementa} />
                <Column header="Autoria" body={autoriaBody} />
                <Column
                    header="Status tramitação"
                    body={(row: Materia) => row.statusTramitacao?.nome ?? '—'}
                />
                <Column
                    header="Situação"
                    body={statusBody}
                    style={{ width: '10rem' }}
                />
            </DataTable>

            <Dialog
                header="Nova matéria"
                visible={open && !!dominios}
                onHide={() => !saving && setOpen(false)}
                modal
                className="sigl-dialog-lg"
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
                {dominios && (
                    <div className="form-stack form-stack--sigl">
                        <p className="form-section-label">Identificação</p>
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
                        <label htmlFor="mat-ementa">Ementa *</label>
                        <InputTextarea
                            id="mat-ementa"
                            value={ementa}
                            onChange={(e) => setEmenta(e.target.value)}
                            rows={3}
                            className="w-full"
                        />
                        <div className="form-grid-2">
                            <div>
                                <label htmlFor="mat-numero">Número</label>
                                <InputText
                                    id="mat-numero"
                                    value={numero}
                                    onChange={(e) => setNumero(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="mat-protocolo">
                                    Nº protocolo
                                </label>
                                <InputText
                                    id="mat-protocolo"
                                    value={numeroProtocolo}
                                    onChange={(e) =>
                                        setNumeroProtocolo(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <label htmlFor="mat-ano">Ano</label>
                        <Dropdown
                            id="mat-ano"
                            value={anoId}
                            options={[
                                emptyOption,
                                ...dominios.anos.map((a) => ({
                                    id: a.id,
                                    nome: String(a.valor),
                                })),
                            ]}
                            optionLabel="nome"
                            optionValue="id"
                            onChange={(e) => setAnoId(e.value)}
                            className="w-full"
                        />

                        <p className="form-section-label">Classificação</p>
                        <label htmlFor="mat-tematica">Temática</label>
                        <Dropdown
                            id="mat-tematica"
                            value={tematicaId}
                            options={[emptyOption, ...dominios.tematicas]}
                            optionLabel="nome"
                            optionValue="id"
                            onChange={(e) => setTematicaId(e.value)}
                            className="w-full"
                        />
                        <label htmlFor="mat-origem">Origem</label>
                        <Dropdown
                            id="mat-origem"
                            value={origemId}
                            options={[emptyOption, ...dominios.origensMateria]}
                            optionLabel="nome"
                            optionValue="id"
                            onChange={(e) => setOrigemId(e.value)}
                            className="w-full"
                        />
                        <label htmlFor="mat-listagem">Tipo de listagem</label>
                        <Dropdown
                            id="mat-listagem"
                            value={tipoListagemId}
                            options={[emptyOption, ...dominios.tiposListagem]}
                            optionLabel="nome"
                            optionValue="id"
                            onChange={(e) => setTipoListagemId(e.value)}
                            className="w-full"
                        />
                        <label htmlFor="mat-data-ap">
                            Data de apresentação
                        </label>
                        <InputText
                            id="mat-data-ap"
                            type="date"
                            value={dataApresentacao}
                            onChange={(e) =>
                                setDataApresentacao(e.target.value)
                            }
                            className="w-full"
                        />

                        <p className="form-section-label">
                            Autoria e representação
                        </p>

                        {isProjetoLei && (
                            <>
                                <label htmlFor="mat-autor-pl">
                                    Autor (vereador) *
                                </label>
                                <Dropdown
                                    id="mat-autor-pl"
                                    value={autorParlamentarId}
                                    options={parlOptions}
                                    optionLabel="nome"
                                    optionValue="id"
                                    onChange={(e) =>
                                        setAutorParlamentarId(e.value)
                                    }
                                    className="w-full"
                                />
                                <label htmlFor="mat-coautores">
                                    Coautor(es)
                                </label>
                                <MultiSelect
                                    id="mat-coautores"
                                    value={coautorIds}
                                    options={parlOptions.filter(
                                        (p) => p.id !== autorParlamentarId,
                                    )}
                                    optionLabel="nome"
                                    optionValue="id"
                                    onChange={(e) =>
                                        setCoautorIds(e.value ?? [])
                                    }
                                    className="w-full"
                                    display="chip"
                                    filter
                                />
                                <label htmlFor="mat-relator-pl">Relator</label>
                                <Dropdown
                                    id="mat-relator-pl"
                                    value={relatorId}
                                    options={[emptyOption, ...parlOptions]}
                                    optionLabel="nome"
                                    optionValue="id"
                                    onChange={(e) => setRelatorId(e.value)}
                                    className="w-full"
                                />
                            </>
                        )}

                        {!isProjetoLei && (
                            <>
                                <label htmlFor="mat-autor">
                                    Autor (cadastro)
                                </label>
                                <Dropdown
                                    id="mat-autor"
                                    value={autorId}
                                    options={[emptyOption, ...autores]}
                                    optionLabel="nome"
                                    optionValue="id"
                                    onChange={(e) => setAutorId(e.value)}
                                    className="w-full"
                                />
                                {permiteRepresentantes && (
                                    <>
                                        <label htmlFor="mat-representantes">
                                            Representantes (vereadores) *
                                        </label>
                                        <MultiSelect
                                            id="mat-representantes"
                                            value={representanteIds}
                                            options={parlOptions}
                                            optionLabel="nome"
                                            optionValue="id"
                                            onChange={(e) =>
                                                setRepresentanteIds(
                                                    e.value ?? [],
                                                )
                                            }
                                            placeholder="Selecione um ou mais vereadores"
                                            className="w-full"
                                            display="chip"
                                            filter
                                        />
                                    </>
                                )}
                                <label htmlFor="mat-relator">Relator</label>
                                <Dropdown
                                    id="mat-relator"
                                    value={relatorId}
                                    options={[emptyOption, ...parlOptions]}
                                    optionLabel="nome"
                                    optionValue="id"
                                    onChange={(e) => setRelatorId(e.value)}
                                    className="w-full"
                                />
                            </>
                        )}

                        <p className="form-section-label">Tramitação</p>
                        <label htmlFor="mat-status-tram">
                            Status tramitação
                        </label>
                        <Dropdown
                            id="mat-status-tram"
                            value={statusId}
                            options={[
                                emptyOption,
                                ...dominios.statusTramitacao,
                            ]}
                            optionLabel="nome"
                            optionValue="id"
                            onChange={(e) => setStatusId(e.value)}
                            className="w-full"
                        />
                        <label htmlFor="mat-unidade">Unidade destino</label>
                        <Dropdown
                            id="mat-unidade"
                            value={unidadeTramitacaoId}
                            options={[
                                emptyOption,
                                ...dominios.unidadesTramitacao,
                            ]}
                            optionLabel="nome"
                            optionValue="id"
                            onChange={(e) => setUnidadeTramitacaoId(e.value)}
                            className="w-full"
                        />
                        <label htmlFor="mat-local-ext">
                            Local origem externa
                        </label>
                        <Dropdown
                            id="mat-local-ext"
                            value={localOrigemExternaId}
                            options={[
                                emptyOption,
                                ...dominios.locaisOrigemExterna,
                            ]}
                            optionLabel="nome"
                            optionValue="id"
                            onChange={(e) => setLocalOrigemExternaId(e.value)}
                            className="w-full"
                        />

                        <IntGestMensagemField
                            id="mat-mensagem"
                            value={mensagem}
                            onChange={setMensagem}
                        />
                    </div>
                )}
            </Dialog>
        </section>
    );
}
