import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { materiasApi } from '../../api/legislative/materias.api';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';
import { DatePicker, Dropdown, FileUpload } from '../../components/ui';
import type {
    AutorSelecionado,
    CoautorFormItem,
    StatusMateria,
} from '../../types/materias';
import {
    buildCreateMateriaApiBody,
    resolveAnoIdFromNumeroAno,
    validateAutorSelecionado,
    validateCoautores,
} from '../../utils/autorMateria';
import { parseNumeroAnoMateria } from '../../utils/materiaIdentificacao';
import { AutorField } from './AutorField';
import { CoautorList } from './CoautorList';
import { MateriaFormShell, type MateriaFormTab } from './MateriaFormShell';

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
    const [numeroAno, setNumeroAno] = useState('');
    const [dataProtocolo, setDataProtocolo] = useState<Date | null>(null);
    const [autorPrincipal, setAutorPrincipal] = useState<AutorSelecionado | null>(null);
    const [coautores, setCoautores] = useState<CoautorFormItem[]>([]);
    const [ementa, setEmenta] = useState('');
    const [justificativa, setJustificativa] = useState('');
    const [textoOriginal, setTextoOriginal] = useState<File | null>(null);

    const tipoSelecionado = tiposMateria.find((t) => t.id === tipoId);
    const sigla =
        (tipoSelecionado as { sigla?: string; nome: string } | undefined)?.sigla ??
        tipoSelecionado?.nome ??
        '';

    const numeroAnoParsed = parseNumeroAnoMateria(numeroAno);
    const previewId =
        tipoSelecionado && numeroAnoParsed.ok
            ? `${sigla} ${numeroAnoParsed.numero}/${numeroAnoParsed.ano}`
            : null;

    const numeroAnoHint =
        numeroAno.trim() && !numeroAnoParsed.ok ? numeroAnoParsed.message : null;

    async function submit(statusFinal: StatusMateria) {
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
            status: statusFinal,
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
                statusFinal === 'PROTOCOLADA'
                    ? `${idStr} protocolada com sucesso.`
                    : statusFinal === 'DRAFT'
                      ? `${idStr} salva como rascunho.`
                      : `${idStr} salva com sucesso.`;
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
        <>
            <Button label="Cancelar" severity="secondary" outlined onClick={onClose} disabled={saving} />
            <Button
                label="Salvar rascunho"
                severity="secondary"
                outlined
                icon="pi pi-save"
                loading={saving}
                onClick={() => void submit('DRAFT')}
            />
            <Button
                label="Salvar"
                icon="pi pi-check"
                loading={saving}
                onClick={() => void submit('DRAFT')}
            />
            <Button
                label="Protocolar"
                icon="pi pi-send"
                loading={saving}
                onClick={() => void submit('PROTOCOLADA')}
            />
        </>
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
                            <label htmlFor="mc-numero">Número *</label>
                            <InputText
                                id="mc-numero"
                                value={numeroAno}
                                onChange={(e) => setNumeroAno(e.target.value)}
                                placeholder="Ex: 85/2026"
                                className="w-full"
                            />
                            {previewId ? (
                                <span className="materia-form-id-preview">
                                    Identificação: <strong>{previewId}</strong>
                                </span>
                            ) : numeroAnoHint ? (
                                <span className="materia-form-hint" style={{ color: 'var(--danger, #ef4444)' }}>
                                    {numeroAnoHint}
                                </span>
                            ) : (
                                <span className="materia-form-hint">
                                    Informe número e ano separados por barra.
                                </span>
                            )}
                        </div>
                        <div className="materia-form-field">
                            <DatePicker
                                id="mc-data-protocolo"
                                label="Data de protocolo"
                                value={dataProtocolo}
                                onChange={setDataProtocolo}
                            />
                        </div>
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

            {activeTab === 'conteudo' && (
                <div className="materia-form-secao">
                    <div className="materia-form-secao-titulo">
                        <i className="pi pi-align-left" aria-hidden />
                        Conteúdo
                    </div>
                    <div className="materia-form-field" style={{ marginBottom: 10 }}>
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
                    <div className="materia-form-field" style={{ marginBottom: 10 }}>
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
                    <FileUpload
                        id="mc-texto-original"
                        label="Texto Original"
                        value={textoOriginal}
                        onChange={setTextoOriginal}
                        accept=".pdf,.doc,.docx"
                    />
                </div>
            )}
        </MateriaFormShell>
    );
}
