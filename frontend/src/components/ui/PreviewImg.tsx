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
    }, [src]);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
            }}
            role="dialog"
            aria-modal="true"
            aria-label={fileName ?? 'Visualizar arquivo'}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                className="relative flex flex-col w-full max-w-4xl bg-white rounded-[12px] overflow-hidden"
                style={{ maxHeight: '90vh' }}
            >
                <div className="flex items-center gap-3 px-5 py-3 border-b border-[#eef0f3]">
                    <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] flex-shrink-0 ${
                            isPdf ? 'bg-red-100 text-red-700' : 'bg-[#e8edf5] text-[#2563a8]'
                        }`}
                    >
                        {isPdf ? 'PDF' : 'IMG'}
                    </span>
                    <span className="flex-1 text-[13px] font-medium text-[#1c2f4a] truncate">
                        {fileName ?? (isPdf ? 'documento.pdf' : 'imagem')}
                    </span>
                    <div className="flex items-center gap-1">
                        <a
                            href={src}
                            download={fileName}
                            target="_blank"
                            rel="noreferrer"
                            className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-[#f5f6f8] hover:text-[#374151] transition-colors"
                            aria-label="Baixar arquivo"
                        >
                            <DownloadOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
                        </a>
                        <a
                            href={src}
                            target="_blank"
                            rel="noreferrer"
                            className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-[#f5f6f8] hover:text-[#374151] transition-colors"
                            aria-label="Abrir em nova aba"
                        >
                            <OpenInNewOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
                        </a>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-[#f5f6f8] hover:text-[#374151] transition-colors"
                            aria-label="Fechar"
                        >
                            <CloseOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <div
                    className="flex items-center justify-center bg-[#f5f6f8] overflow-hidden"
                    style={{ minHeight: '400px', maxHeight: 'calc(90vh - 56px)' }}
                >
                    {isPdf ? (
                        <iframe
                            src={src}
                            title={fileName}
                            className="w-full border-0"
                            style={{ height: 'calc(90vh - 56px)' }}
                        />
                    ) : imgError ? (
                        <div className="flex flex-col items-center gap-3 py-16 text-[#b0bac8]">
                            <BrokenImageOutlined
                                sx={{ fontSize: 48, color: '#dde2ea' }}
                                aria-hidden="true"
                            />
                            <span className="text-[13px]">
                                Não foi possível carregar a imagem.
                            </span>
                            <a
                                href={src}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[13px] text-[#2563a8] hover:underline"
                            >
                                Abrir em nova aba
                            </a>
                        </div>
                    ) : (
                        <img
                            src={src}
                            alt={fileName ?? 'imagem'}
                            className="max-w-full object-contain p-4"
                            style={{ maxHeight: 'calc(90vh - 56px)' }}
                            onError={() => setImgError(true)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
