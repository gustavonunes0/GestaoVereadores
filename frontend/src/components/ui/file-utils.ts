export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageAccept(accept: string): boolean {
    const a = accept.toLowerCase();
    return a.includes('image/') || /\.(jpe?g|png|webp|gif)/i.test(a);
}

export function acceptHintLabel(accept: string): { long: string; short: string } {
    if (isImageAccept(accept)) {
        return { long: 'JPEG, PNG ou WebP · máx. 2 MB', short: 'IMG' };
    }
    if (
        accept.includes('pdf') ||
        accept.includes('.doc') ||
        accept.includes('docx')
    ) {
        return { long: 'PDF, DOC ou DOCX', short: 'PDF / DOC' };
    }
    if (accept.includes('audio') || accept.includes('.mp3')) {
        return { long: 'Áudio (MP3, WAV…)', short: 'ÁUDIO' };
    }
    return {
        long: accept
            .split(',')
            .map((p) => p.trim().replace(/^\./, '').toUpperCase())
            .filter(Boolean)
            .join(', '),
        short: 'ARQ',
    };
}

export function isImageValue(
    value: File | string | null | undefined,
    accept = '',
): boolean {
    if (!value) return false;
    if (value instanceof File) return value.type.startsWith('image/');
    if (typeof value === 'string') {
        const v = value.trim();
        if (v.startsWith('data:image/')) return true;
        if (/\.(jpe?g|png|webp|gif)(\?|$)/i.test(v)) return true;
        if (v.startsWith('/uploads/') && isImageAccept(accept)) return true;
        if (isImageAccept(accept) && (v.startsWith('data:') || v.startsWith('http'))) {
            return true;
        }
    }
    return false;
}

export function getFileName(value: File | string): string {
    if (typeof value !== 'string') return value.name;
    if (value.startsWith('data:image/')) return 'Foto de perfil';
    if (value.startsWith('data:')) return 'Arquivo anexado';
    return value.split('/').pop() ?? value;
}

export function getMimeType(value: File | string): string | undefined {
    if (typeof value === 'string') {
        if (value.startsWith('data:')) {
            const match = /^data:([^;]+)/.exec(value);
            return match?.[1];
        }
        if (value.endsWith('.pdf')) return 'application/pdf';
        if (/\.jpe?g(\?|$)/i.test(value)) return 'image/jpeg';
        if (/\.png(\?|$)/i.test(value)) return 'image/png';
        if (/\.webp(\?|$)/i.test(value)) return 'image/webp';
        return undefined;
    }
    return value.type || undefined;
}

export function getPreviewSrc(value: File | string): string {
    return typeof value === 'string' ? value : URL.createObjectURL(value);
}

export function getFileTypeLabel(value: File | string): string {
    const mime = getMimeType(value);
    if (mime?.startsWith('image/')) {
        if (mime.includes('png')) return 'PNG';
        if (mime.includes('webp')) return 'WebP';
        if (mime.includes('jpeg') || mime.includes('jpg')) return 'JPEG';
        return 'Imagem';
    }
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
