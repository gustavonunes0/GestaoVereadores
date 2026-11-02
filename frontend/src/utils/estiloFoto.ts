import type { CSSProperties } from 'react';

export type FotoFraming = {
    photoPosX?: number | null;
    photoPosY?: number | null;
    photoZoom?: number | null;
};

/** Estilo compartilhado entre prévias do cadastro e cards do painel de votação. */
export function estiloFoto({
    photoPosX = 50,
    photoPosY = 30,
    photoZoom = 1,
}: FotoFraming = {}): CSSProperties {
    const x = Number.isFinite(Number(photoPosX)) ? Number(photoPosX) : 50;
    const y = Number.isFinite(Number(photoPosY)) ? Number(photoPosY) : 30;
    const zoom = Number.isFinite(Number(photoZoom)) ? Number(photoZoom) : 1;
    return {
        objectFit: 'cover',
        objectPosition: `${x}% ${y}%`,
        transform: `scale(${zoom})`,
        transformOrigin: `${x}% ${y}%`,
    };
}
