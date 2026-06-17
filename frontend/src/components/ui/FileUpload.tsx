import { useEffect, useId, useRef, useState } from 'react';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import InsertDriveFileOutlined from '@mui/icons-material/InsertDriveFileOutlined';
import SwapHorizOutlined from '@mui/icons-material/SwapHorizOutlined';
import UploadFileOutlined from '@mui/icons-material/UploadFileOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import {
    formatBytes,
    getFileName,
    getFileTypeLabel,
    getMimeType,
} from './file-utils';
import { PreviewImg } from './PreviewImg';

export interface FileUploadProps {
    id?: string;
    label?: string;
    accept?: string;
    required?: boolean;
    value: File | string | null;
    onChange: (file: File | null) => void;
    error?: string;
    className?: string;
}

export function FileUpload({
    id,
    label,
    accept = '.pdf,.doc,.docx',
    required = false,
    value,
    onChange,
    error,
    className = '',
}: FileUploadProps) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const inputRef = useRef<HTMLInputElement>(null);
    const objectUrlRef = useRef<string | null>(null);
    const [dragging, setDragging] = useState(false);
    const [preview, setPreview] = useState(false);

    const hasFile = value != null && !(typeof value === 'string' && value === '');

    useEffect(() => {
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
        };
    }, []);

    function handleFiles(files: FileList | null) {
        const file = files?.[0] ?? null;
        if (!file) return;
        onChange(file);
        setDragging(false);
    }

    function handleDrop(event: React.DragEvent) {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
    }

    function handleRemove(event: React.MouseEvent) {
        event.stopPropagation();
        onChange(null);
        if (inputRef.current) inputRef.current.value = '';
    }

    function resolvePreviewSrc(): string {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        const url = URL.createObjectURL(value);
        objectUrlRef.current = url;
        return url;
    }

    const fileName = value ? getFileName(value) : '';
    const fileTypeLabel = value ? getFileTypeLabel(value) : '';
    const fileSize =
        value instanceof File ? formatBytes(value.size) : undefined;

    return (
        <div className={`flex flex-col gap-1.5 ${className}`.trim()}>
            {label ? (
                <label htmlFor={fieldId} className="text-[13px] font-medium text-[#374151]">
                    {label}
                    {required ? <span className="text-red-500 ml-0.5">*</span> : null}
                </label>
            ) : null}

            <div
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => {
                    if (!hasFile) inputRef.current?.click();
                }}
                className={[
                    'flex items-center gap-3 px-4 py-3 rounded-[8px] border transition-colors',
                    !hasFile && 'cursor-pointer',
                    dragging && 'border-[#2563a8] bg-[#f0f4fa]',
                    hasFile && !dragging && 'border-[#dde2ea] bg-[#fafbfc]',
                    !hasFile &&
                        !dragging &&
                        !error &&
                        'border-dashed border-[#dde2ea] bg-white hover:border-[#2563a8] hover:bg-[#f0f4fa]',
                    error && 'border-red-400 bg-red-50',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <div
                    className={`flex items-center justify-center w-9 h-9 rounded-[7px] flex-shrink-0 ${
                        hasFile ? 'bg-[#e8edf5]' : 'bg-[#f5f6f8]'
                    }`}
                >
                    {hasFile ? (
                        <InsertDriveFileOutlined
                            sx={{ fontSize: 20, color: '#2563a8' }}
                            aria-hidden="true"
                        />
                    ) : (
                        <UploadFileOutlined
                            sx={{ fontSize: 20, color: '#8492a6' }}
                            aria-hidden="true"
                        />
                    )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    {hasFile ? (
                        <>
                            <span className="text-[13px] font-medium text-[#374151] truncate">
                                {fileName}
                            </span>
                            <span className="text-[11px] text-[#8492a6]">
                                {fileTypeLabel}
                                {fileSize ? ` · ${fileSize}` : ''}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="text-[13px] text-[#374151]">
                                {dragging ? (
                                    'Solte para enviar'
                                ) : (
                                    <>
                                        Arraste ou{' '}
                                        <span className="text-[#2563a8] font-medium">
                                            clique para selecionar
                                        </span>
                                    </>
                                )}
                            </span>
                            <span className="text-[11px] text-[#b0bac8]">
                                PDF, DOC ou DOCX
                            </span>
                        </>
                    )}
                </div>

                {hasFile ? (
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                setPreview(true);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-[#e8edf5] hover:text-[#2563a8] transition-colors"
                            aria-label="Visualizar arquivo"
                        >
                            <VisibilityOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                inputRef.current?.click();
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-[#f5f6f8] hover:text-[#374151] transition-colors"
                            aria-label="Trocar arquivo"
                        >
                            <SwapHorizOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-red-50 hover:text-red-500 transition-colors"
                            aria-label="Remover arquivo"
                        >
                            <DeleteOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
                        </button>
                    </div>
                ) : (
                    <span className="text-[10px] font-medium text-[#8492a6] bg-[#f0f4fa] px-2 py-0.5 rounded-[4px] flex-shrink-0">
                        PDF / DOC
                    </span>
                )}

                <input
                    ref={inputRef}
                    id={fieldId}
                    type="file"
                    accept={accept}
                    className="sr-only"
                    onChange={(event) => handleFiles(event.target.files)}
                />
            </div>

            {error ? (
                <p className="text-[11px] text-red-500 flex items-center gap-1">
                    <ErrorOutlineOutlined sx={{ fontSize: 13 }} aria-hidden="true" />
                    {error}
                </p>
            ) : null}

            {preview && hasFile && value ? (
                <PreviewImg
                    src={resolvePreviewSrc()}
                    fileName={getFileName(value)}
                    mimeType={getMimeType(value)}
                    onClose={() => setPreview(false)}
                />
            ) : null}
        </div>
    );
}
