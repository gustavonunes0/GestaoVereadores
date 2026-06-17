export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const MAX_PHOTO_DIMENSION = 640;
const JPEG_QUALITY = 0.82;
/** Limite do data URL após compressão (~700 KB base64). */
const MAX_DATA_URL_CHARS = 700_000;

export function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') resolve(reader.result);
            else reject(new Error('Falha ao ler arquivo'));
        };
        reader.onerror = () => reject(reader.error ?? new Error('Falha ao ler arquivo'));
        reader.readAsDataURL(file);
    });
}

/** Redimensiona e comprime imagens antes de enviar no JSON (evita payload > 1 MB). */
export async function preparePhotoDataUrl(file: File): Promise<string> {
    if (!file.type.startsWith('image/')) {
        return fileToDataUrl(file);
    }

    try {
        const bitmap = await createImageBitmap(file);
        const longest = Math.max(bitmap.width, bitmap.height);
        const scale =
            longest > MAX_PHOTO_DIMENSION ? MAX_PHOTO_DIMENSION / longest : 1;
        const width = Math.max(1, Math.round(bitmap.width * scale));
        const height = Math.max(1, Math.round(bitmap.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            bitmap.close();
            return fileToDataUrl(file);
        }
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        if (dataUrl.length > MAX_DATA_URL_CHARS) {
            throw new Error(
                'A foto ainda é grande demais após compressão. Use uma imagem menor.',
            );
        }
        return dataUrl;
    } catch (err) {
        if (err instanceof Error && err.message.includes('grande demais')) throw err;
        return fileToDataUrl(file);
    }
}
