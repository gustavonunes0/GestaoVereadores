import type { PosicaoCadeira } from '../types/presenca';

/** ViewBox do mapa — ~800×400, responsivo via CSS. */
export const PLENARIO_VIEWBOX = { w: 800, h: 400 } as const;

const CENTRO_X = PLENARIO_VIEWBOX.w / 2;
const CENTRO_Y = 78;
const RAIO_BASE = 167;
const RAIO_PASSO = 53;
const ANG_ESQUERDA = Math.PI * 0.3;
const ANG_DIREITA = Math.PI * 0.7;

/** Retângulo decorativo da mesa (coordenadas do viewBox). */
export const MESA_LAYOUT = {
    w: 280,
    h: 64,
    x: (PLENARIO_VIEWBOX.w - 280) / 2,
    y: 16,
} as const;

const CARGO_MESA_ORDEM = [
    'Presidente',
    'Vice-Presidente',
    'Primeiro Secretário',
    'Segundo Secretário',
    '1º Secretário',
    '2º Secretário',
];

export function ordenarCargosMesa(a: string, b: string): number {
    const ia = CARGO_MESA_ORDEM.findIndex(
        (c) => a.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(a.toLowerCase()),
    );
    const ib = CARGO_MESA_ORDEM.findIndex(
        (c) => b.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(b.toLowerCase()),
    );
    const ra = ia >= 0 ? ia : 99;
    const rb = ib >= 0 ? ib : 99;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b, 'pt-BR');
}

export function distribuirFileiras(total: number): number[] {
    if (total <= 0) return [];
    const numFileiras = Math.max(1, Math.min(Math.ceil(total / 4), 4));
    const capacidades = Array.from({ length: numFileiras }, (_, f) => 4 + f);
    const capTotal = capacidades.reduce((sum, n) => sum + n, 0);

    const fileiras: number[] = [];
    let alocadas = 0;
    for (let f = 0; f < numFileiras; f++) {
        let qtd =
            f === numFileiras - 1
                ? total - alocadas
                : Math.max(1, Math.round(total * (capacidades[f] / capTotal)));
        if (alocadas + qtd > total) qtd = total - alocadas;
        if (qtd <= 0) break;
        fileiras.push(qtd);
        alocadas += qtd;
    }
    while (alocadas < total) {
        fileiras[fileiras.length - 1]++;
        alocadas++;
    }
    return fileiras;
}

export function calcularPosicoes(total: number): PosicaoCadeira[] {
    const fileiras = distribuirFileiras(total);
    const posicoes: PosicaoCadeira[] = [];

    fileiras.forEach((n, f) => {
        const r = RAIO_BASE + f * RAIO_PASSO;
        const spread = 0.5 + f * 0.06;
        const aMid = (ANG_ESQUERDA + ANG_DIREITA) / 2;
        const aHalf = ((ANG_DIREITA - ANG_ESQUERDA) / 2) * (spread / 0.5);
        const aL = aMid - aHalf;
        const aR = aMid + aHalf;

        for (let i = 0; i < n; i++) {
            const frac = n === 1 ? 0.5 : i / (n - 1);
            const ang = aL + frac * (aR - aL);
            posicoes.push({
                x: CENTRO_X + r * Math.cos(ang),
                y: CENTRO_Y + r * Math.sin(ang),
                rotacaoGraus: ((ang - Math.PI / 2) * 180) / Math.PI,
            });
        }
    });

    return posicoes;
}

/** Cadeiras da mesa diretora — sobre a mesa, voltadas ao plenário. */
export function calcularPosicoesMesa(total: number): PosicaoCadeira[] {
    if (total <= 0) return [];
    const { x: mesaX, y: mesaY, w: mesaW, h: mesaH } = MESA_LAYOUT;
    const y = mesaY + mesaH / 2 + 2;
    const padding = 28;
    const xMin = mesaX + padding;
    const xMax = mesaX + mesaW - padding;
    const step = total === 1 ? 0 : (xMax - xMin) / (total - 1);
    return Array.from({ length: total }, (_, i) => ({
        x: xMin + step * i,
        y,
        rotacaoGraus: 180,
    }));
}

export function abreviarNome(nome: string): string {
    const p = nome.trim().split(/\s+/);
    if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
    return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}
