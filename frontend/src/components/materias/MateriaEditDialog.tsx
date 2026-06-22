import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { materiasApi } from '../../api/legislative/materias.api';
import type { Materia, MatterAuthorship } from '../../api/legislative/materias.api';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';
import { DatePicker, FileUpload } from '../../components/ui';
import {
    resolveMateriaIdentificacao,
    resolveMateriaNumeroAno,
    resolveMateriaAno,
    resolveMateriaStatus,
} from '../../utils/materiaDisplay';
import type { MateriaStatus } from '../../types/legislative';
import type {
    AutorSelecionado,
    CoautorFormItem,
} from '../../types/materias';
import {
    gerarOpcoesStatus,
    statusTransicaoPermitida,
} from '../../types/materias';
import {
    autorFromMatterAuthorship,
    coautoresFromMatterAuthorship,
    extractParlamentarianCoautorIds,
    resolveAnoIdFromNumeroAno,
    validateAutorSelecionado,
    validateCoautores,
} from '../../utils/autorMateria';
import {
    formatNumeroAnoInput,
    formatarIdentificacao,
    parseNumeroAnoMateria,
} from '../../utils/materiaIdentificacao';
import { AutorField } from './AutorField';
import { CoautorList } from './CoautorList';
import { MateriaFormShell, type MateriaFormTab } from './MateriaFormShell';
import { MateriaStatusField } from './MateriaStatusField';

interface Props {
    materia: Materia;
    onClose: () => void;
    onSaved: () => void;
}

const EDIT_TABS: MateriaFormTab[] = ['identificacao', 'autoria', 'conteudo'];

export function MateriaEditDialog({ materia, onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const { anos } = useDominios();
    const [saving, setSaving] = useState(false);
    const [loadingAutoria, setLoadingAutoria] = useState(true);
    const [activeTab, setActiveTab] = useState<MateriaFormTab>('identificacao');

    const resolvedStatus = resolveMateriaStatus(materia.status);

    const isRascunho = resolvedStatus === 'DRAFT';
    const isProtocolada = resolvedStatus === 'PROTOCOLADA';
    const canEditConteudo = isRascunho || isProtocolada;

    const [numeroAno, setNumeroAno] = useState(() =>
        formatNumeroAnoInput(materia.numero, resolveMateriaAno(materia)),
    );
    const [ementa, setEmenta] = useState(materia.ementa);
    const [justificativa, setJustificativa] = useState('');
    const [dataProtocolo, setDataProtocolo] = useState<Date | null>(
        materia.dataProtocolo ? new Date(materia.dataProtocolo) : null,
    );
    const [statusMateria, setStatusMateria] = useState<MateriaStatus>(resolvedStatus);
    const [autorPrincipal, setAutorPrincipal] = useState<AutorSelecionado | null>(null);
    const [coautores, setCoautores] = useState<CoautorFormItem[]>([]);
    const [textoOriginal, setTextoOriginal] = useState<File | null>(null);

    const coautoresIniciaisRef = useRef<Array<{ id: string; parliamentarianId: string }>>([]);
    const autorInicialRef = useRef<AutorSelecionado | null>(null);

    useEffect(() => {
        setLoadingAutoria(true);
        materiasApi
            .getAutoria(materia.id)
            .then((autoria: MatterAuthorship) => {
                const autor = autorFromMatterAuthorship(autoria);
                setAutorPrincipal(autor);
                autorInicialRef.current = autor;
                setCoautores(coautoresFromMatterAuthorship(autoria));
                coautoresIniciaisRef.current = (autoria.coauthors ?? []).map((c) => ({
                    id: c.id,
                    parliamentarianId: c.parliamentarian.id,
                }));
            })
            .catch(showApiError)
            .finally(() => setLoadingAutoria(false));
    }, [materia.id, showApiError]);

    const statusOptions = useMemo(
        () => gerarOpcoesStatus(resolvedStatus),
        [resolvedStatus],
    );

    function handleStatusChange(next: MateriaStatus) {
        if (statusTransicaoPermitida(resolvedStatus, next)) {
            setStatusMateria(next);
        }
    }

    const numeroAnoParsed = parseNumeroAnoMateria(numeroAno);
    const previewIdentificacao = formatarIdentificacao({
        tipo: materia.tipo,
        sigla: materia.sigla,
        numero: isRascunho && numeroAnoParsed.ok ? numeroAnoParsed.numero : materia.numero,
        ano: isRascunho && numeroAnoParsed.ok ? numeroAnoParsed.ano : materia.ano,
    });

    const numeroAnoHint =
        isRascunho && numeroAno.trim() && !numeroAnoParsed.ok
            ? numeroAnoParsed.message
            : null;

    async function syncCoautores() {
        const desejados = extractParlamentarianCoautorIds(coautores);
        const iniciais = coautoresIniciaisRef.current;

        const desejadosSet = new Set(desejados);
        const iniciaisPorParlId = new Map(
            iniciais.map((c) => [c.parliamentarianId, c.id]),
        );

        for (const inicial of iniciais) {
            if (!desejadosSet.has(inicial.parliamentarianId)) {
                await materiasApi.removeCoautor(materia.id, inicial.id);
            }
        }

        for (const parlId of desejados) {
            if (!iniciaisPorParlId.has(parlId)) {
                await materiasApi.addCoautor(materia.id, { parliamentarianId: parlId });
            }
        }
    }

    async function syncAutor() {
        if (!isRascunho || !autorPrincipal) return;

        const inicial = autorInicialRef.current;
        const autorAlterado =
            !inicial ||
            inicial.tipo !== autorPrincipal.tipo ||
            (autorPrincipal.tipo === 'PARLAMENTAR' &&
                inicial.parlamentarianId !== autorPrincipal.parlamentarianId) ||
            (autorPrincipal.tipo === 'TENANT_PARTNER' &&
                inicial.tenantPartnerId !== autorPrincipal.tenantPartnerId);

        if (!autorAlterado) return;

        if (autorPrincipal.tipo === 'PARLAMENTAR' && autorPrincipal.parlamentarianId) {
            await materiasApi.setAutorParlamentar(
                materia.id,
                autorPrincipal.parlamentarianId,
            );
        } else if (autorPrincipal.tipo === 'TENANT_PARTNER' && autorPrincipal.tenantPartnerId) {
            await materiasApi.setTenantPartner(materia.id, autorPrincipal.tenantPartnerId);
        }
    }

    async function handleSubmit() {
        if (!ementa.trim()) {
            showApiError(new Error('Ementa é obrigatória.'));
            setActiveTab('conteudo');
            return;
        }

        let numeroUpdate: { numero: number; anoId: string } | undefined;

        if (isRascunho) {
            const numeroResolvido = resolveAnoIdFromNumeroAno(numeroAno, anos);
            if (!numeroResolvido.ok) {
                showApiError(new Error(numeroResolvido.message));
                setActiveTab('identificacao');
                return;
            }
            numeroUpdate = {
                numero: numeroResolvido.numero,
                anoId: numeroResolvido.anoId,
            };

            const autorError = validateAutorSelecionado(autorPrincipal);
            if (autorError) {
                showApiError(new Error(autorError));
                setActiveTab('autoria');
                return;
            }
        }

        const coautorError = validateCoautores(coautores);
        if (coautorError) {
            showApiError(new Error(coautorError));
            setActiveTab('autoria');
            return;
        }

        setSaving(true);
        try {
            await materiasApi.update(materia.id, {
                ementa: ementa.trim(),
                ...(justificativa.trim() ? { justificativa: justificativa.trim() } : {}),
                dataProtocolo: dataProtocolo?.toISOString(),
                ...(numeroUpdate ?? {}),
            });

            if (isRascunho) {
                await syncAutor();
            }

            await syncCoautores();

            if (textoOriginal) {
                await materiasApi.uploadTextoOriginal(materia.id, textoOriginal);
            }

            if (statusMateria !== resolvedStatus) {
                await materiasApi.tramitar(materia.id, {
                    novoStatus: statusMateria,
                });
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
        <>
            <Button label="Cancelar" severity="secondary" outlined onClick={onClose} disabled={saving} />
            <Button
                label="Salvar"
                icon="pi pi-check"
                loading={saving}
                onClick={() => void handleSubmit()}
            />
        </>
    );

    return (
        <MateriaFormShell
            title={`Editar — ${resolveMateriaIdentificacao(materia)}`}
            icon="pi-pencil"
            tabs={EDIT_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onClose={onClose}
            footer={footer}
            saving={saving}
        >
            {activeTab === 'identificacao' && (
                <div className="materia-form-secao">
                    <div className="materia-form-secao-titulo">
                        <i className="pi pi-id-card" aria-hidden />
                        Identificação
                    </div>
                    <div className="materia-form-grid-2">
                        <div className="materia-form-field">
                            <label>Tipo de Matéria</label>
                            <p className="materia-form-readonly-value">{materia.tipo.nome}</p>
                        </div>
                        <div className="materia-form-field">
                            <label>Número / Ano {isRascunho ? '*' : ''}</label>
                            {isRascunho ? (
                                <>
                                    <InputText
                                        id="edit-numero-ano"
                                        value={numeroAno}
                                        onChange={(e) => setNumeroAno(e.target.value)}
                                        placeholder="Ex: 85/2026"
                                        className="w-full"
                                    />
                                    {numeroAnoHint ? (
                                        <span
                                            className="materia-form-hint"
                                            style={{ color: 'var(--danger, #ef4444)' }}
                                        >
                                            {numeroAnoHint}
                                        </span>
                                    ) : (
                                        <span className="materia-form-hint">
                                            Informe número e ano separados por barra.
                                        </span>
                                    )}
                                </>
                            ) : (
                                <p className="materia-form-readonly-value">
                                    {resolveMateriaNumeroAno(materia)}
                                </p>
                            )}
                        </div>
                        <div className="materia-form-field">
                            <DatePicker
                                id="edit-data-protocolo"
                                label="Data de protocolo"
                                value={dataProtocolo}
                                onChange={setDataProtocolo}
                            />
                        </div>
                    </div>
                    <span className="materia-form-id-preview">
                        Identificação: <strong>{previewIdentificacao}</strong>
                    </span>
                    {!isRascunho && (
                        <span className="materia-form-hint block mt-1">
                            Tipo e número não podem ser alterados após protocolação.
                        </span>
                    )}

                    <MateriaStatusField
                        id="edit-status"
                        value={statusMateria}
                        options={statusOptions}
                        onChange={handleStatusChange}
                    />
                </div>
            )}

            {activeTab === 'autoria' && (
                <>
                    {loadingAutoria ? (
                        <p className="text-color-secondary m-0">Carregando autoria…</p>
                    ) : (
                        <>
                            <div className="materia-form-secao">
                                <div className="materia-form-secao-titulo">
                                    <i className="pi pi-user" aria-hidden />
                                    Autoria
                                </div>
                                <AutorField
                                    value={autorPrincipal}
                                    onChange={setAutorPrincipal}
                                    labelTipo="Tipo de Autor *"
                                    labelAutor="Autor *"
                                    disabled={!isRascunho}
                                />
                            </div>

                            <div className="materia-form-separador" />

                            <div className="materia-form-secao">
                                <CoautorList value={coautores} onChange={setCoautores} />
                            </div>
                        </>
                    )}
                </>
            )}

            {activeTab === 'conteudo' && (
                <div className="materia-form-secao">
                    <div className="materia-form-secao-titulo">
                        <i className="pi pi-align-left" aria-hidden />
                        Conteúdo
                    </div>
                    <div className="materia-form-field" style={{ marginBottom: 10 }}>
                        <label htmlFor="edit-ementa">Ementa *</label>
                        <InputTextarea
                            id="edit-ementa"
                            value={ementa}
                            onChange={(e) => setEmenta(e.target.value)}
                            rows={3}
                            autoResize
                            placeholder="Descreva o objetivo da matéria…"
                            disabled={!canEditConteudo}
                            className="w-full"
                        />
                    </div>
                    <div className="materia-form-field" style={{ marginBottom: 10 }}>
                        <label htmlFor="edit-justificativa">Justificativa</label>
                        <InputTextarea
                            id="edit-justificativa"
                            value={justificativa}
                            onChange={(e) => setJustificativa(e.target.value)}
                            rows={4}
                            autoResize
                            placeholder="Fundamentos e motivações (opcional)…"
                            disabled={!canEditConteudo}
                            className="w-full"
                        />
                    </div>
                    {canEditConteudo && (
                        <FileUpload
                            id="edit-texto-original"
                            label="Texto Original"
                            value={textoOriginal}
                            onChange={setTextoOriginal}
                            accept=".pdf,.doc,.docx"
                        />
                    )}
                </div>
            )}

        </MateriaFormShell>
    );
}
