import { useState } from 'react';
import { Button } from 'primereact/button';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { useAppToast } from '../../../hooks/useAppToast';

interface Props {
    sessaoId: string;
    linkYoutube: string;
    onChange: (link: string) => void;
    variant?: 'default' | 'inline';
}

export function YoutubeConfigForm({ sessaoId, linkYoutube, onChange, variant = 'default' }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [saving, setSaving] = useState(false);

    async function salvar() {
        setSaving(true);
        try {
            await sessoesApi.updateLinkYoutube(sessaoId, linkYoutube);
            showSuccess('Link do YouTube salvo.');
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    function copiar() {
        void navigator.clipboard.writeText(linkYoutube);
        showSuccess('Link copiado.');
    }

    function abrir() {
        if (linkYoutube) window.open(linkYoutube, '_blank', 'noopener');
    }

    return (
        <div>
            {variant === 'default' && (
                <p className="text-sm font-semibold mb-2">Link do YouTube</p>
            )}
            {variant === 'inline' && (
                <div className="text-xs font-medium text-color-secondary mb-1">
                    Link do YouTube (transmissão pública)
                </div>
            )}
            <div className={variant === 'inline' ? 'transmissao-yt-row' : 'flex gap-2 flex-wrap'}>
                <input
                    className={variant === 'inline' ? 'transmissao-yt-input' : undefined}
                    type="text"
                    value={linkYoutube}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="https://youtube.com/live/..."
                    aria-label="Link YouTube"
                    style={variant === 'default' ? { flex: 1, minWidth: 0 } : undefined}
                />
                {variant === 'default' ? (
                    <>
                        <Button
                            label="Salvar"
                            size="small"
                            loading={saving}
                            onClick={() => void salvar()}
                        />
                        <Button
                            icon="pi pi-copy"
                            size="small"
                            severity="secondary"
                            outlined
                            aria-label="Copiar link"
                            onClick={copiar}
                            disabled={!linkYoutube}
                        />
                        <Button
                            icon="pi pi-external-link"
                            size="small"
                            severity="secondary"
                            outlined
                            aria-label="Abrir link"
                            onClick={abrir}
                            disabled={!linkYoutube}
                        />
                    </>
                ) : (
                    <>
                        <button type="button" className="transmissao-btn" onClick={() => void salvar()} disabled={saving}>
                            <i className="pi pi-save" aria-hidden />
                            Salvar
                        </button>
                        <button type="button" className="transmissao-btn transmissao-btn-ghost" onClick={copiar} disabled={!linkYoutube} aria-label="Copiar link">
                            <i className="pi pi-copy" aria-hidden />
                        </button>
                        <button type="button" className="transmissao-btn transmissao-btn-ghost" onClick={abrir} disabled={!linkYoutube} aria-label="Abrir no YouTube">
                            <i className="pi pi-external-link" aria-hidden />
                        </button>
                    </>
                )}
            </div>
            <small className={`text-color-secondary mt-1 block${variant === 'inline' ? ' text-xs' : ''}`}>
                <i className="pi pi-info-circle mr-1" style={{ fontSize: 12 }} aria-hidden />
                A stream key é extraída automaticamente da URL.
            </small>
        </div>
    );
}
