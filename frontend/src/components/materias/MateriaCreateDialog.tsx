import { useMemo, useState } from 'react';
import { materiasApi } from '../../api/legislative/materias.api';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';
import { DatePicker, Dropdown, FileUpload, LexDialogFooter } from '../../components/ui';
import type { MateriaStatus } from '../../types/legislative';
import type {
    AutorSelecionado,
    CoautorFormItem,
} from '../../types/materias';
import { gerarOpcoesStatus } from '../../types/materias';import {
    buildCreateMateriaApiBody,
    resolveAnoIdFromNumeroAno,
    validateAutorSelecionado,
    validateCoautores,
} from '../../utils/autorMateria';
import { parseNumeroAnoMateria, composeNumeroAnoMateria } from '../../utils/materiaIdentificacao';
import { AutorField } from './AutorField';
import { CoautorList } from './CoautorList';
import { MateriaFormShell, type MateriaFormTab } from './MateriaFormShell';
import { MateriaStatusField } from './MateriaStatusField';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

const CREATE_TABS: MateriaFormTab[] = ['identificacao', 'autoria', 'conteudo'];

interface Props {
    onClose: () => void;
    onSaved: () => void;
}

export function MateriaCreateDialog({ onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const { tiposMateria, anos } = useDominios();
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<MateriaFormTab>('identificacao');

    const [tipoId, setTipoId] = useState('');
    const [numeroMateria, setNumeroMateria] = useState('');
    const [anoLegislatura, setAnoLegislatura] = useState('');
    const [dataProtocolo, setDataProtocolo] = useState<Date | null>(null);
    const [autorPrincipal, setAutorPrincipal] = useState<AutorSelecionado | null>(null);
    const [coautores, setCoautores] = useState<CoautorFormItem[]>([]);
    const [ementa, setEmenta] = useState('');
    const [justificativa, setJustificativa] = useState('');
    const [textoOriginal, setTextoOriginal] = useState<File | null>(null);
    const [statusMateria, setStatusMateria] = useState<MateriaStatus>('DRAFT');

    const statusOptions = useMemo(() => gerarOpcoesStatus('DRAFT'), []);

    const tipoSelecionado = tiposMateria.find((t) => t.id === tipoId);
    const sigla =
        (tipoSelecionado as { sigla?: string; nome: string } | undefined)?.sigla ??
        tipoSelecionado?.nome ??
        '';

    const numeroAno = composeNumeroAnoMateria(numeroMateria, anoLegislatura);
    const numeroAnoParsed = parseNumeroAnoMateria(numeroAno);
    const camposPreenchidos = Boolean(numeroMateria.trim() || anoLegislatura.trim());
    const previewId =
        tipoSelecionado && numeroAnoParsed.ok
            ? `${sigla} ${numeroAnoParsed.numero}/${numeroAnoParsed.ano}`
            : null;

    const numeroAnoHint =
        camposPreenchidos && !numeroAnoParsed.ok ? numeroAnoParsed.message : null;

    async function submit() {
        if (!tipoId) {
            showApiError(new Error('Selecione o tipo de matéria.'));
            setActiveTab('identificacao');
            return;
        }

        const numeroResolvido = resolveAnoIdFromNumeroAno(numeroAno, anos);
        if (!numeroResolvido.ok) {
            showApiError(new Error(numeroResolvido.message));
            setActiveTab('identificacao');
            return;
        }

        if (!ementa.trim()) {
            showApiError(new Error('Ementa é obrigatória.'));
            setActiveTab('conteudo');
            return;
        }

        const autorError = validateAutorSelecionado(autorPrincipal);
        if (autorError) {
            showApiError(new Error(autorError));
            setActiveTab('autoria');
            return;
        }

        const coautorError = validateCoautores(coautores);
        if (coautorError) {
            showApiError(new Error(coautorError));
            setActiveTab('autoria');
            return;
        }

        const body = buildCreateMateriaApiBody({
            tipoId,
            numeroAno,
            anoId: numeroResolvido.anoId,
            dataProtocolo: dataProtocolo?.toISOString(),
            ementa: ementa.trim(),
            justificativa: justificativa.trim() || undefined,
            status: statusMateria,
            autor: autorPrincipal!,
            coautores,
        });

        setSaving(true);
        try {
            const created = await materiasApi.create(body);
            if (textoOriginal) {
                await materiasApi.uploadTextoOriginal(created.id, textoOriginal);
            }

            const idStr = previewId ?? tipoSelecionado?.nome ?? 'Matéria';
            const msg =
                statusMateria === 'PROTOCOLADA'
                    ? `${idStr} protocolada com sucesso.`
                    : `${idStr} salva como rascunho.`;
            showSuccess(msg);
            onSaved();
            onClose();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    const footer = (
        <LexDialogFooter
            onCancel={onClose}
            onConfirm={() => void submit()}
            confirmLabel="Salvar"
            loading={saving}
            cancelDisabled={saving}
        />
    );

    return (
        <MateriaFormShell
            title="Nova Matéria Legislativa"
            icon="pi-file-plus"
            tabs={CREATE_TABS}
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
                    <div className="materia-form-grid-3">
                        <div className="materia-form-field">
                            <label htmlFor="mc-tipo">Tipo de Matéria *</label>
                            <Dropdown
                                id="mc-tipo"
                                value={tipoId || null}
                                options={tiposMateria.map((t) => ({
                                    label: t.nome,
                                    value: t.id,
                                }))}
                                placeholder="Selecionar…"
                                onChange={(v) => setTipoId(String(v))}
                                filter
                            />
                        </div>
                        <div className="materia-form-field">
                            <label htmlFor="mc-numero">Nº da matéria *</label>
                            <InputText
                                id="mc-numero"
                                value={numeroMateria}
                                onChange={(e) => setNumeroMateria(e.target.value.replace(/\D/g, ''))}
                                placeholder="Ex: 85"
                                inputMode="numeric"
                                className="w-full"
                            />
                        </div>
                        <div className="materia-form-field">
                            <label htmlFor="mc-ano">Ano da legislatura *</label>
                            <InputText
                                id="mc-ano"
                                value={anoLegislatura}
                                onChange={(e) =>
                                    setAnoLegislatura(e.target.value.replace(/\D/g, '').slice(0, 4))
                                }
                                placeholder="Ex: 2026"
                                inputMode="numeric"
                                maxLength={4}
                                className="w-full"
                            />
                        </div>
                    </div>
                    {(previewId || numeroAnoHint) && (
                        <div className="materia-form-field" style={{ marginTop: 4 }}>
                            {previewId ? (
                                <span className="materia-form-id-preview">
                                    Identificação: <strong>{previewId}</strong>
                                </span>
                            ) : (
                                <span
                                    className="materia-form-hint"
                                    style={{ color: 'var(--danger, #ef4444)' }}
                                >
                                    {numeroAnoHint}
                                </span>
                            )}
                        </div>
                    )}
                    <div className="materia-form-grid-3" style={{ marginTop: 10 }}>
                        <div className="materia-form-field">
                            <DatePicker
                                id="mc-data-protocolo"
                                label="Data de protocolo"
                                value={dataProtocolo}
                                onChange={setDataProtocolo}
                            />
                        </div>
                    </div>

                    <MateriaStatusField
                        id="mc-status"
                        value={statusMateria}
                        options={statusOptions}
                        onChange={setStatusMateria}
                    />
                </div>
            )}

            {activeTab === 'conteudo' && (
                <div className="materia-form-secao">
                    <div className="materia-form-secao-titulo">
                        <i className="pi pi-align-left" aria-hidden />
                        Conteúdo
                    </div>
                    <div className="materia-form-field">
                        <label htmlFor="mc-ementa">Ementa *</label>
                        <InputTextarea
                            id="mc-ementa"
                            value={ementa}
                            onChange={(e) => setEmenta(e.target.value)}
                            rows={3}
                            autoResize
                            placeholder="Descreva o objetivo da matéria…"
                            className="w-full"
                        />
                    </div>
                    <div className="materia-form-field">
                        <label htmlFor="mc-justificativa">Justificativa</label>
                        <InputTextarea
                            id="mc-justificativa"
                            value={justificativa}
                            onChange={(e) => setJustificativa(e.target.value)}
                            rows={4}
                            autoResize
                            placeholder="Fundamentos e motivações (opcional)…"
                            className="w-full"
                        />
                    </div>
                    <div className="materia-form-field materia-form-field--file">
                        <FileUpload
                            id="mc-texto-original"
                            label="Texto Original"
                            value={textoOriginal}
                            onChange={setTextoOriginal}
                            accept=".pdf,.doc,.docx"
                        />
                    </div>
                </div>
            )}

            {activeTab === 'autoria' && (
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
                        />
                    </div>

                    <div className="materia-form-separador" />

                    <div className="materia-form-secao">
                        <CoautorList value={coautores} onChange={setCoautores} />
                    </div>
                </>
            )}
        </MateriaFormShell>
    );
}
