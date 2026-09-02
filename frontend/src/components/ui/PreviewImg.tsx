import { useEffect, useState } from 'react';
import BrokenImageOutlined from '@mui/icons-material/BrokenImageOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';

export interface PreviewImgProps {
    src: string;
    fileName?: string;
    mimeType?: string;
    onClose: () => void;
}

export function PreviewImg({ src, fileName, mimeType, onClose }: PreviewImgProps) {
    const [imgError, setImgError] = useState(false);
    const [pdfError, setPdfError] = useState(false);
    const isPdf =
        mimeType === 'application/pdf' || src.toLowerCase().includes('.pdf');

    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    useEffect(() => {
        setImgError(false);
        setPdfError(false);
    }, [src]);

    useEffect(() => {
        if (!isPdf || !src || src.startsWith('blob:')) return;

        const controller = new AbortController();
        let cancelled = false;

        void (async () => {
            try {
                const res = await fetch(src, {
                    method: 'GET',
                    signal: controller.signal,
                    credentials: 'include',
                });
                if (cancelled) return;
                if (!res.ok) {
                    setPdfError(true);
                    return;
                }
                const contentType = res.headers.get('content-type') ?? '';
                if (
                    contentType.includes('application/json') ||
                    contentType.includes('text/html')
                ) {
                    setPdfError(true);
                }
            } catch {
                if (!cancelled) setPdfError(true);
            }
        })();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [isPdf, src]);

    return (
        <div
            className="sigl-file-preview"
            role="dialog"
            aria-modal="true"
            aria-label={fileName ?? 'Visualizar arquivo'}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="sigl-file-preview__panel">
                <div className="sigl-file-preview__header">
                    <span
                        className={`sigl-file-preview__type ${
                            isPdf
                                ? 'sigl-file-preview__type--pdf'
                                : 'sigl-file-preview__type--img'
                        }`}
                    >
                        {isPdf ? 'PDF' : 'IMG'}
                    </span>
                    <span className="sigl-file-preview__title">
                        {fileName ?? (isPdf ? 'documento.pdf' : 'imagem')}
                    </span>
                    <div className="sigl-file-preview__toolbar">
                        {!pdfError && !imgError ? (
                            <>
                                <a
                                    href={src}
                                    download={fileName}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="sigl-file-upload__action"
                                    aria-label="Baixar arquivo"
                                >
                                    <DownloadOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
                                </a>
                                <a
                                    href={src}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="sigl-file-upload__action"
                                    aria-label="Abrir em nova aba"
                                >
                                    <OpenInNewOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
                                </a>
                            </>
                        ) : null}
                        <button
                            type="button"
                            onClick={onClose}
                            className="sigl-file-upload__action"
                            aria-label="Fechar"
                        >
                            <CloseOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <div className="sigl-file-preview__body">
                    {isPdf && pdfError ? (
                        <div className="sigl-file-preview__empty">
                            <BrokenImageOutlined
                                sx={{ fontSize: 48, color: 'var(--input-border)' }}
                                aria-hidden="true"
                            />
                            <span className="sigl-file-preview__empty-title">
                                Arquivo não encontrado
                            </span>
                            <p className="sigl-file-preview__empty-text">
                                O texto original não está disponível no servidor. Peça o
                                reenvio do PDF ou confira o armazenamento de uploads.
                            </p>
                        </div>
                    ) : isPdf ? (
                        <iframe
                            src={src}
                            title={fileName}
                            className="sigl-file-preview__iframe"
                        />
                    ) : imgError ? (
                        <div className="sigl-file-preview__empty">
                            <BrokenImageOutlined
                                sx={{ fontSize: 48, color: 'var(--input-border)' }}
                                aria-hidden="true"
                            />
                            <span className="sigl-file-preview__empty-text">
                                Não foi possível carregar a imagem.
                            </span>
                            <a
                                href={src}
                                target="_blank"
                                rel="noreferrer"
                                className="sigl-file-preview__link"
                            >
                                Abrir em nova aba
                            </a>
                        </div>
                    ) : (
                        <img
                            src={src}
                            alt={fileName ?? 'imagem'}
                            className="sigl-file-preview__image"
                            onError={() => setImgError(true)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
