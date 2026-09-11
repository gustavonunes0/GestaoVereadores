import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { confirmDialog } from 'primereact/confirmdialog';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { ApiError } from '../../../api/client';
import { API_PATHS } from '../../../api/paths';
import { useAppToast } from '../../../hooks/useAppToast';
import { usePermissions } from '../../../hooks/usePermissions';
import type { Ata } from '../../../types/ata';
import type { StatusSessao } from '../../../types/sessoes';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export function AtaTab({
    sessaoId,
    statusSessao,
}: {
    sessaoId: string;
    statusSessao: StatusSessao;
}) {
    const { canManageSessao } = usePermissions();
    const { showApiError, showSuccess } = useAppToast();
    const [ata, setAta] = useState<Ata | null>(null);
    const [loading, setLoading] = useState(true);
    const [gerando, setGerando] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [aprovando, setAprovando] = useState(false);
    const [conteudo, setConteudo] = useState('');
    const editorRef = useRef<HTMLDivElement>(null);
    const conteudoServidorRef = useRef('');

    const sincronizarEditor = useCallback((html: string) => {
        setConteudo(html);
        conteudoServidorRef.current = html;
        if (editorRef.current) {
            editorRef.current.innerHTML = html;
        }
    }, []);

    const carregar = useCallback(async () => {
        setLoading(true);
        try {
            const data = await sessoesApi.getAta(sessaoId);
            setAta(data);
            sincronizarEditor(data.conteudo);
        } catch (err) {
            if (err instanceof ApiError && err.status === 404) {
                setAta(null);
            } else {
                showApiError(err);
            }
        } finally {
            setLoading(false);
        }
    }, [sessaoId, showApiError, sincronizarEditor]);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    useEffect(() => {
        if (!editorRef.current || !conteudoServidorRef.current) return;
        if (editorRef.current.innerHTML !== conteudoServidorRef.current) {
            editorRef.current.innerHTML = conteudoServidorRef.current;
        }
    }, [ata?.id, loading]);

    if (statusSessao !== 'ENCERRADA') {
        return (
            <div className="sessao-empty-state sessao-empty-state--compact">
                <i className="pi pi-file-edit" aria-hidden />
                <span>A ata fica disponível após o encerramento da sessão.</span>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-content-center p-4">
                <ProgressSpinner style={{ width: 40, height: 40 }} />
            </div>
        );
    }

    async function gerarRascunho() {
        setGerando(true);
        try {
            const data = await sessoesApi.gerarRascunhoAta(sessaoId);
            setAta(data);
            sincronizarEditor(data.conteudo);
            showSuccess('Rascunho da ata gerado a partir dos dados da sessão.');
        } catch (err) {
            showApiError(err);
        } finally {
            setGerando(false);
        }
    }

    async function salvar() {
        const html = editorRef.current?.innerHTML ?? conteudo;
        setSalvando(true);
        try {
            const data = await sessoesApi.updateAta(sessaoId, html);
            setAta(data);
            sincronizarEditor(data.conteudo);
            showSuccess('Ata salva.');
        } catch (err) {
            showApiError(err);
        } finally {
            setSalvando(false);
        }
    }

    function confirmarAprovacao() {
        confirmDialog({
            header: 'Aprovar ata',
            message: 'Depois de aprovada, a ata não pode mais ser editada. Confirma a aprovação?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Aprovar',
            rejectLabel: 'Cancelar',
            className: 'lex-dialog lex-dialog--dense lex-dialog--confirm',
            accept: () => void aprovar(),
        });
    }

    async function aprovar() {
        const html = editorRef.current?.innerHTML ?? conteudo;
        setAprovando(true);
        try {
            if (html !== ata?.conteudo) {
                await sessoesApi.updateAta(sessaoId, html);
            }
            const data = await sessoesApi.aprovarAta(sessaoId);
            setAta(data);
            showSuccess('Ata aprovada.');
        } catch (err) {
            showApiError(err);
        } finally {
            setAprovando(false);
        }
    }

    if (!ata) {
        return (
            <div className="sessao-empty-state sessao-empty-state--compact">
                <i className="pi pi-file-edit" aria-hidden />
                <span>Nenhuma ata gerada para esta sessão ainda.</span>
                {canManageSessao && (
                    <Button
                        label="Gerar rascunho da ata"
                        icon="pi pi-file-plus"
                        size="small"
                        loading={gerando}
                        onClick={() => void gerarRascunho()}
                    />
                )}
            </div>
        );
    }

    const editavel = ata.status.value === 'RASCUNHO' && canManageSessao;
    const pdfUrl = `${API_BASE}${API_PATHS.sessaoAtaPdf(sessaoId)}`;
    const statusBadgeClass =
        ata.status.value === 'RASCUNHO' ? 'badge badge--info' : 'badge badge--success';

    return (
        <div className="ata-tab">
            <div className="ata-toolbar">
                <span className={statusBadgeClass}>{ata.status.label}</span>
                <div className="ata-toolbar__actions">
                    {editavel && (
                        <>
                            <Button
                                label="Salvar"
                                icon="pi pi-save"
                                size="small"
                                severity="secondary"
                                loading={salvando}
                                onClick={() => void salvar()}
                            />
                            <Button
                                label="Aprovar ata"
                                icon="pi pi-check"
                                size="small"
                                severity="success"
                                loading={aprovando}
                                onClick={confirmarAprovacao}
                            />
                        </>
                    )}
                    {ata.status.value !== 'RASCUNHO' && (
                        <a href={pdfUrl} target="_blank" rel="noreferrer">
                            <Button
                                label="Baixar PDF"
                                icon="pi pi-download"
                                size="small"
                                outlined
                            />
                        </a>
                    )}
                </div>
            </div>

            <div
                className={[
                    'ata-conteudo-leitura',
                    editavel ? 'ata-conteudo-leitura--editavel' : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                {editavel ? (
                    <div
                        ref={editorRef}
                        className="ata-editor-visual"
                        contentEditable
                        suppressContentEditableWarning
                        role="textbox"
                        aria-multiline="true"
                        aria-label="Conteúdo da ata"
                        onBlur={(e) => setConteudo(e.currentTarget.innerHTML)}
                    />
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: ata.conteudo }} />
                )}
            </div>
        </div>
    );
}
