import { useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { TabView, TabPanel } from 'primereact/tabview';
import { AutoComplete } from 'primereact/autocomplete';
import { Dropdown as PrDropdown } from 'primereact/dropdown';
import { materiasApi } from '../../api/legislative/materias.api';
import { parlamentaresApi, type Parliamentarian } from '../../api/legislative/parlamentares.api';
import { tenantPartnersApi, type TenantPartner } from '../../api/tenant-partners.api';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';
import { DatePicker, FileUpload } from '../../components/ui';
import type { Materia, MatterAuthorship } from '../../api/legislative/materias.api';
import {
    resolveMateriaIdentificacao,
    resolveMateriaNumeroAno,
} from '../../utils/materiaDisplay';
import type { MateriaStatus } from '../../types/legislative';
import type { StatusMateria, TipoAutorMateria } from '../../types/materias';
import {
    STATUS_MATERIA_LABELS,
    TIPOS_AUTOR_OPTIONS,
    gerarOpcoesStatus,
} from '../../types/materias';
import { CoautorSection } from './CoautorSection';


interface Props {
    materia: Materia;
    onClose: () => void;
    onSaved: () => void;
}

function findParlamentarTipoId(tiposAutor: Array<{ id: string; nome: string; codigo?: string }>): string {
    return tiposAutor.find(
        (t) => t.codigo === '1' || t.nome.trim().toLowerCase() === 'parlamentar',
    )?.id ?? '';
}

export function MateriaEditDialog({ materia, onClose, onSaved }: Props) {
    const { showSuccess, showApiError, showToast } = useAppToast();
    const showWarning = (msg: string) => showToast('warn', 'Aviso', msg);
    const { tiposAutor } = useDominios();
    const [saving, setSaving] = useState(false);
    const [loadingAutoria, setLoadingAutoria] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    const parlamentarTipoId = useMemo(() => findParlamentarTipoId(tiposAutor), [tiposAutor]);

    // Identificação
    const [ementa, setEmenta] = useState(materia.ementa);
    const [justificativa, setJustificativa] = useState('');
    const [dataProtocolo, setDataProtocolo] = useState<Date | null>(
        materia.dataProtocolo ? new Date(materia.dataProtocolo) : null,
    );

    const resolvedStatus = (typeof materia.status === 'string' ? materia.status : materia.status.value) as string;
    const [statusMateria, setStatusMateria] = useState<StatusMateria>(resolvedStatus as StatusMateria);

    const isRascunho = resolvedStatus === 'RASCUNHO';
    const isProtocolada = resolvedStatus === 'PROTOCOLADA';
    const isEncerrada = ['APROVADA_PELO_LEGISLATIVO', 'VETADA', 'SANCIONADA'].includes(resolvedStatus);

    const canEditIdentificacao = isRascunho;
    const canEditConteudo = isRascunho || isProtocolada;

    // Autoria
    const [tipoAutor, setTipoAutor] = useState<TipoAutorMateria | ''>('');
    const [autorInicial, setAutorInicial] = useState<{ tipoAutorId: string; autorId: string } | null>(null);

    const [parlSugestoes, setParlSugestoes] = useState<Parliamentarian[]>([]);
    const [parlSelecionado, setParlSelecionado] = useState<Parliamentarian | null>(null);

    const [partners, setPartners] = useState<TenantPartner[]>([]);
    const [partnerSelecionado, setPartnerSelecionado] = useState<TenantPartner | null>(null);
    const [partnerAutorId, setPartnerAutorId] = useState('');
    const [partnerAutorLabel, setPartnerAutorLabel] = useState('');
    const [loadingPartners, setLoadingPartners] = useState(false);

    const [autorTexto, setAutorTexto] = useState('');
    const [textoOriginal, setTextoOriginal] = useState<File | null>(null);

    useEffect(() => {
        if (!parlamentarTipoId) return;
        setLoadingAutoria(true);
        materiasApi
            .getAutoria(materia.id)
            .then((autoria: MatterAuthorship) => {
                const author = autoria.primaryAuthor;
                if (!author) return;
                if (author.type === 'parliamentarian' && author.parliamentarian) {
                    setTipoAutor('PARLAMENTAR');
                    setAutorInicial({ tipoAutorId: parlamentarTipoId, autorId: author.parliamentarian.id });
                } else if (author.type === 'external') {
                    const partner = 'tenantPartner' in author ? author.tenantPartner : null;
                    if (partner?.id) {
                        setTipoAutor('TENANT_PARTNER');
                        setPartnerAutorId(partner.id);
                        setPartnerAutorLabel(partner.nome ?? '');
                        setAutorInicial({ tipoAutorId: partner.tipoAutorId ?? '', autorId: partner.id });
                    }
                }
            })
            .catch(showApiError)
            .finally(() => setLoadingAutoria(false));
    }, [materia.id, parlamentarTipoId, showApiError]);

    useEffect(() => {
        if (tipoAutor !== 'TENANT_PARTNER') return;
        setLoadingPartners(true);
        tenantPartnersApi.list({ limit: 100 })
            .then((r) => setPartners(r.data))
            .catch(() => setPartners([]))
            .finally(() => setLoadingPartners(false));
    }, [tipoAutor]);

    const buscarParlamentar = async (query: string) => {
        if (query.length < 2) { setParlSugestoes([]); return; }
        try {
            const res = await parlamentaresApi.list({ busca: query, limit: 20 });
            setParlSugestoes(res.data);
        } catch {
            setParlSugestoes([]);
        }
    };

    const handleSelectPartner = (partner: TenantPartner | null) => {
        setPartnerSelecionado(partner);
        if (!partner) { setPartnerAutorId(''); setPartnerAutorLabel(''); return; }
        if (!partner.usuario && !partner.usuarioVinculado) {
            showWarning('Esta instituição não possui usuário vinculado. Vincule em Câmara > Autores.');
            setPartnerAutorId('');
            setPartnerAutorLabel('');
            return;
        }
        const usuarioNome = partner.usuario?.nome ?? partner.nome;
        setPartnerAutorId(partner.id);
        setPartnerAutorLabel(`${usuarioNome} (${partner.nome})`);
    };

    const statusOptions = useMemo(
        () => gerarOpcoesStatus(resolvedStatus as StatusMateria).map((s) => ({
            label: STATUS_MATERIA_LABELS[s],
            value: s,
        })),
        [resolvedStatus],
    );

    async function handleSubmit() {
        if (!ementa.trim()) { showApiError(new Error('Ementa é obrigatória.')); return; }
        setSaving(true);
        try {
            await materiasApi.update(materia.id, {
                ementa: ementa.trim(),
                ...(justificativa.trim() ? { justificativa: justificativa.trim() } : {}),
                dataProtocolo: dataProtocolo?.toISOString(),
                ...(statusMateria !== resolvedStatus ? { statusNovo: statusMateria } : {}),
            } as Record<string, unknown>);

            const autoriaAlterada = autorInicial
                ? (tipoAutor === 'PARLAMENTAR' && parlSelecionado && parlSelecionado.id !== autorInicial.autorId) ||
                  (tipoAutor === 'TENANT_PARTNER' && partnerAutorId && partnerAutorId !== autorInicial.autorId)
                : false;

            if (autoriaAlterada && isRascunho) {
                if (tipoAutor === 'PARLAMENTAR' && parlSelecionado) {
                    await materiasApi.setAutorParlamentar(materia.id, parlSelecionado.id);
                } else if (tipoAutor === 'TENANT_PARTNER' && partnerAutorId) {
                    await materiasApi.setTenantPartner(materia.id, partnerAutorId);
                }
            }

            if (textoOriginal) {
                await materiasApi.uploadTextoOriginal(materia.id, textoOriginal);
            }

            if (statusMateria !== resolvedStatus) {
                await materiasApi.tramitar(materia.id, { statusNovo: statusMateria as unknown as MateriaStatus });
            }

            showSuccess('Matéria atualizada com sucesso.');
            onSaved();
            onClose();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={saving} />
            <Button label="Salvar" icon="pi pi-check" loading={saving} onClick={() => void handleSubmit()} />
        </div>
    );

    return (
        <Dialog
            header={`Editar — ${resolveMateriaIdentificacao(materia)}`}
            visible
            onHide={() => !saving && onClose()}
            style={{ width: 'min(96vw, 720px)' }}
            footer={footer}
            modal
        >
            <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
                {/* ── Aba 1: Identificação ── */}
                <TabPanel header="Identificação">
                    <div className="sigl-dialog-body pt-3">
                        <div className="sigl-dialog-grid sigl-dialog-grid-2">
                            <div className="sigl-filtro-campo">
                                <label className="text-xs text-color-secondary">Tipo de Matéria</label>
                                <p className="font-semibold m-0">{materia.tipo.nome}</p>
                            </div>
                            <div className="sigl-filtro-campo">
                                <label className="text-xs text-color-secondary">Número / Ano</label>
                                <p className="font-semibold m-0">{resolveMateriaNumeroAno(materia)}</p>
                            </div>
                            <div className="sigl-filtro-campo">
                                <DatePicker
                                    id="edit-data-protocolo"
                                    label="Data Protocolo"
                                    value={dataProtocolo}
                                    onChange={setDataProtocolo}
                                />
                            </div>
                            <div className="sigl-filtro-campo">
                                <label htmlFor="edit-status">Status</label>
                                <PrDropdown
                                    id="edit-status"
                                    value={statusMateria}
                                    options={statusOptions}
                                    onChange={(e) => setStatusMateria(e.value as StatusMateria)}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        {!canEditIdentificacao && (
                            <small className="text-color-secondary">
                                Tipo e número não podem ser alterados após protocolação.
                            </small>
                        )}
                    </div>
                </TabPanel>

                {/* ── Aba 2: Autoria ── */}
                <TabPanel header="Autoria">
                    <div className="sigl-dialog-body pt-3">
                        {loadingAutoria ? (
                            <p className="text-color-secondary">Carregando autoria…</p>
                        ) : (
                            <>
                                <div className="sigl-dialog-grid sigl-dialog-grid-2">
                                    <div className="sigl-filtro-campo">
                                        <label htmlFor="edit-tipo-autor">Tipo de Autor</label>
                                        <PrDropdown
                                            id="edit-tipo-autor"
                                            value={tipoAutor}
                                            options={TIPOS_AUTOR_OPTIONS}
                                            optionLabel="label"
                                            optionValue="value"
                                            placeholder="Selecione o tipo"
                                            onChange={(e) => {
                                                setTipoAutor(e.value as TipoAutorMateria);
                                            }}
                                            className="w-full"
                                            disabled={!isRascunho}
                                        />
                                    </div>

                                    {tipoAutor === 'PARLAMENTAR' && (
                                        <div className="sigl-filtro-campo">
                                            <label>Parlamentar</label>
                                            {isRascunho ? (
                                                <AutoComplete
                                                    value={parlSelecionado ?? undefined}
                                                    suggestions={parlSugestoes}
                                                    completeMethod={(e) => void buscarParlamentar(e.query)}
                                                    field="parliamentaryName"
                                                    onChange={(e) => setParlSelecionado((e.value as Parliamentarian | undefined) ?? null)}
                                                    onSelect={(e) => setParlSelecionado(e.value as Parliamentarian)}
                                                    placeholder="Digite para buscar…"
                                                    minLength={2}
                                                    forceSelection
                                                    emptyMessage="Nenhum parlamentar encontrado"
                                                    className="w-full"
                                                    style={{ width: '100%' }}
                                                />
                                            ) : (
                                                <p className="font-medium m-0">{autorInicial?.autorId ?? '—'}</p>
                                            )}
                                        </div>
                                    )}

                                    {tipoAutor === 'TENANT_PARTNER' && (
                                        <div className="sigl-filtro-campo">
                                            <label>Instituição parceira</label>
                                            {isRascunho ? (
                                                <>
                                                    <PrDropdown
                                                        value={partnerSelecionado}
                                                        options={partners}
                                                        optionLabel="nome"
                                                        placeholder={loadingPartners ? 'Carregando...' : 'Selecione'}
                                                        onChange={(e) => handleSelectPartner(e.value as TenantPartner)}
                                                        className="w-full"
                                                        disabled={loadingPartners}
                                                        filter
                                                    />
                                                    {partnerAutorLabel && (
                                                        <small className="text-color-secondary">{partnerAutorLabel}</small>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="font-medium m-0">{partnerAutorLabel || '—'}</p>
                                            )}
                                        </div>
                                    )}

                                    {(tipoAutor === 'EXECUTIVO' || tipoAutor === 'COMISSAO') && (
                                        <div className="sigl-filtro-campo">
                                            <label>Nome do órgão</label>
                                            <InputText
                                                value={autorTexto}
                                                onChange={(e) => setAutorTexto(e.target.value)}
                                                disabled={!isRascunho}
                                                className="w-full"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3">
                                    <CoautorSection materiaId={materia.id} readOnly={isEncerrada} />
                                </div>
                            </>
                        )}
                    </div>
                </TabPanel>

                {/* ── Aba 3: Conteúdo ── */}
                <TabPanel header="Conteúdo">
                    <div className="sigl-dialog-body pt-3">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="edit-ementa">Ementa *</label>
                            <InputTextarea
                                id="edit-ementa"
                                value={ementa}
                                onChange={(e) => setEmenta(e.target.value)}
                                rows={3}
                                autoResize
                                disabled={!canEditConteudo}
                                className="w-full"
                            />
                        </div>
                        <div className="sigl-filtro-campo mt-3">
                            <label htmlFor="edit-justificativa">Justificativa</label>
                            <InputTextarea
                                id="edit-justificativa"
                                value={justificativa}
                                onChange={(e) => setJustificativa(e.target.value)}
                                rows={4}
                                autoResize
                                disabled={!canEditConteudo}
                                className="w-full"
                            />
                        </div>
                        {canEditConteudo && (
                            <div className="sigl-filtro-campo mt-3">
                                <FileUpload
                                    id="edit-texto-original"
                                    label="Substituir Texto Original (PDF / DOC)"
                                    value={textoOriginal}
                                    onChange={setTextoOriginal}
                                    accept=".pdf,.doc,.docx"
                                />
                            </div>
                        )}
                    </div>
                </TabPanel>
            </TabView>
        </Dialog>
    );
}
