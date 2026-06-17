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

export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
