import { MAX_PHOTO_BYTES, preparePhotoDataUrl } from '../../utils/fileToDataUrl';

export const PARLAMENTAR_PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp';

export async function resolveParlamentarPhotoUrl(
    value: File | string | null,
    initialUrl?: string | null,
): Promise<string | null | undefined> {
    if (value instanceof File) {
        if (value.size > MAX_PHOTO_BYTES) {
            throw new Error('A foto deve ter no máximo 2 MB.');
        }
        return preparePhotoDataUrl(value);
    }
    if (typeof value === 'string' && value.trim()) {
        return value;
    }
    if (value === null && initialUrl) {
        return null;
    }
    return undefined;
}
