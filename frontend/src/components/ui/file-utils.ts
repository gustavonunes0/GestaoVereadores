export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileName(value: File | string): string {
    return typeof value === 'string' ? (value.split('/').pop() ?? value) : value.name;
}

export function getMimeType(value: File | string): string | undefined {
    if (typeof value === 'string') {
        return value.endsWith('.pdf') ? 'application/pdf' : undefined;
    }
    return value.type || undefined;
}

export function getPreviewSrc(value: File | string): string {
    return typeof value === 'string' ? value : URL.createObjectURL(value);
}

export function getFileTypeLabel(value: File | string): string {
    const mime = getMimeType(value);
    if (mime === 'application/pdf') return 'PDF';
    if (mime?.includes('word') || (typeof value === 'string' && value.endsWith('.docx'))) {
        return 'DOCX';
    }
    if (typeof value === 'string' && value.endsWith('.doc')) return 'DOC';
    if (value instanceof File) {
        const ext = value.name.split('.').pop()?.toUpperCase();
        return ext ?? 'Arquivo';
    }
    return 'Arquivo';
}
