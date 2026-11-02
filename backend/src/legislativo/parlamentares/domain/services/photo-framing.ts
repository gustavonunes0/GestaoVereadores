import { UnprocessableEntityException } from '@nestjs/common';

export type PhotoFramingInput = {
    photoPosX?: number;
    photoPosY?: number;
    photoZoom?: number;
    photoPositionConfirmed?: boolean;
};

export type PhotoFramingValues = {
    photoPosX: number;
    photoPosY: number;
    photoZoom: number;
    photoPositionConfirmed: boolean;
};

const DEFAULTS: PhotoFramingValues = {
    photoPosX: 50,
    photoPosY: 30,
    photoZoom: 1,
    photoPositionConfirmed: false,
};

function inRange(v: unknown, min: number, max: number): v is number {
    return typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
}

/** Valida campos de enquadramento; retorna nomes dos campos inválidos. */
export function validatePhotoFramingFields(
    input: PhotoFramingInput,
    opts: { requireConfirmed?: boolean } = {},
): string[] {
    const erros: string[] = [];
    if (!inRange(input.photoPosX, 0, 100)) erros.push('photoPosX');
    if (!inRange(input.photoPosY, 0, 100)) erros.push('photoPosY');
    if (!inRange(input.photoZoom, 0.85, 2.5)) erros.push('photoZoom');
    if (opts.requireConfirmed && input.photoPositionConfirmed !== true) {
        erros.push('photoPositionConfirmed');
    }
    return erros;
}

export function assertPhotoFraming(
    input: PhotoFramingInput,
    opts: { requireConfirmed?: boolean } = {},
): PhotoFramingValues {
    const erros = validatePhotoFramingFields(input, opts);
    if (erros.length) {
        throw new UnprocessableEntityException({
            erro: 'Defina o enquadramento da foto',
            campos: erros,
        });
    }
    return {
        photoPosX: input.photoPosX as number,
        photoPosY: input.photoPosY as number,
        photoZoom: input.photoZoom as number,
        photoPositionConfirmed: input.photoPositionConfirmed === true,
    };
}

export function defaultPhotoFraming(): PhotoFramingValues {
    return { ...DEFAULTS };
}

export function toPhotoFramingNumbers(row: {
    photoPosX: unknown;
    photoPosY: unknown;
    photoZoom: unknown;
    photoPositionConfirmed: boolean;
}): PhotoFramingValues {
    return {
        photoPosX: Number(row.photoPosX),
        photoPosY: Number(row.photoPosY),
        photoZoom: Number(row.photoZoom),
        photoPositionConfirmed: Boolean(row.photoPositionConfirmed),
    };
}
