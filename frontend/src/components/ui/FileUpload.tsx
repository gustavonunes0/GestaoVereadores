import { useEffect, useId, useRef, useState } from 'react';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import InsertDriveFileOutlined from '@mui/icons-material/InsertDriveFileOutlined';
import SwapHorizOutlined from '@mui/icons-material/SwapHorizOutlined';
import UploadFileOutlined from '@mui/icons-material/UploadFileOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import {
    acceptHintLabel,
    formatBytes,
    getFileName,
    getFileTypeLabel,
    getMimeType,
    isImageValue,
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
    disabled?: boolean;
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
    disabled = false,
}: FileUploadProps) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const inputRef = useRef<HTMLInputElement>(null);
    const objectUrlRef = useRef<string | null>(null);
    const [dragging, setDragging] = useState(false);
    const [preview, setPreview] = useState(false);
    const [thumbSrc, setThumbSrc] = useState<string | null>(null);

    const hasFile = value != null && !(typeof value === 'string' && value === '');
    const hints = acceptHintLabel(accept);

    useEffect(() => {
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }
        if (!hasFile || !value) {
            setThumbSrc(null);
            return;
        }
        if (typeof value === 'string' && isImageValue(value, accept)) {
            setThumbSrc(value);
            return;
        }
        if (value instanceof File && value.type.startsWith('image/')) {
            const url = URL.createObjectURL(value);
            objectUrlRef.current = url;
            setThumbSrc(url);
            return;
        }
        setThumbSrc(null);
    }, [value, hasFile, accept]);

    function handleFiles(files: FileList | null) {
        if (disabled) return;
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
        if (objectUrlRef.current) return objectUrlRef.current;
        const url = URL.createObjectURL(value);
        objectUrlRef.current = url;
        return url;
    }

    const fileName = value ? getFileName(value) : '';
    const fileTypeLabel = value ? getFileTypeLabel(value) : '';
    const fileSize = value instanceof File ? formatBytes(value.size) : undefined;

    const zoneClass = [
        'sigl-file-upload__zone',
        hasFile ? 'sigl-file-upload__zone--filled' : 'sigl-file-upload__zone--empty',
        !hasFile && !disabled ? 'sigl-file-upload__zone--clickable' : '',
        dragging ? 'sigl-file-upload__zone--drag' : '',
        error ? 'sigl-file-upload__zone--error' : '',
        disabled ? 'sigl-file-upload__zone--disabled' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={['sigl-file-upload', className].filter(Boolean).join(' ')}>
            {label ? (
                <label htmlFor={fieldId} className="sigl-file-upload__label">
                    {label}
                    {required ? <span className="sigl-file-upload__required">*</span> : null}
                </label>
            ) : null}

            <div
                onDragOver={(event) => {
                    event.preventDefault();
                    if (!disabled) setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => {
                    if (!hasFile && !disabled) inputRef.current?.click();
                }}
                className={zoneClass}
            >
                <div
                    className={`sigl-file-upload__thumb${hasFile ? ' sigl-file-upload__thumb--filled' : ''}`}
                >
                    {hasFile && thumbSrc ? (
                        <img src={thumbSrc} alt="" />
                    ) : hasFile ? (
                        <InsertDriveFileOutlined
                            className="sigl-file-upload__icon"
                            sx={{ fontSize: 20 }}
                            aria-hidden="true"
                        />
                    ) : (
                        <UploadFileOutlined
                            className="sigl-file-upload__icon--muted"
                            sx={{ fontSize: 20 }}
                            aria-hidden="true"
                        />
                    )}
                </div>

                <div className="sigl-file-upload__body">
                    {hasFile ? (
                        <>
                            <span className="sigl-file-upload__name">{fileName}</span>
                            <span className="sigl-file-upload__meta">
                                {fileTypeLabel}
                                {fileSize ? ` · ${fileSize}` : ''}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="sigl-file-upload__prompt">
                                {dragging ? (
                                    'Solte para enviar'
                                ) : (
                                    <>
                                        Arraste ou{' '}
                                        <span className="sigl-file-upload__prompt-link">
                                            clique para selecionar
                                        </span>
                                    </>
                                )}
                            </span>
                            <span className="sigl-file-upload__hint sigl-file-upload__hint--placeholder">
                                {hints.long}
                            </span>
                        </>
                    )}
                </div>

                {hasFile ? (
                    <div className="sigl-file-upload__actions">
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                setPreview(true);
                            }}
                            className="sigl-file-upload__action sigl-file-upload__action--primary"
                            aria-label="Visualizar arquivo"
                        >
                            <VisibilityOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
                        </button>
                        {!disabled ? (
                            <>
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        inputRef.current?.click();
                                    }}
                                    className="sigl-file-upload__action"
                                    aria-label="Trocar arquivo"
                                >
                                    <SwapHorizOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="sigl-file-upload__action sigl-file-upload__action--danger"
                                    aria-label="Remover arquivo"
                                >
                                    <DeleteOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
                                </button>
                            </>
                        ) : null}
                    </div>
                ) : (
                    <span className="sigl-file-upload__badge">{hints.short}</span>
                )}

                <input
                    ref={inputRef}
                    id={fieldId}
                    type="file"
                    accept={accept}
                    className="sr-only"
                    disabled={disabled}
                    onChange={(event) => handleFiles(event.target.files)}
                />
            </div>

            {error ? (
                <p className="sigl-file-upload__error">
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
