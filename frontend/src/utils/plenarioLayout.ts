import type { PresencaParlamentar } from '../types/presenca';

/** Capacidade fixa do plenário conforme design (6 fileiras × 7 assentos por lado). */
export const PLENARIO_CAPACIDADE = {
    fileiras: 6,
    assentosPorFileira: 7,
    mesaCadeiras: 5,
} as const;

export type AssentoPlenario = PresencaParlamentar | null;

const CARGO_MESA_ORDEM = [
    'Presidente',
    'Vice-Presidente',
    'Primeiro Secretário',
    'Segundo Secretário',
    '1º Secretário',
    '2º Secretário',
];

/** Configuração visual de cada fileira — rotação e padding (layout compacto). */
const FILEIRA_VISUAL = [
    { rotacao: 8, deskRot: 4, padding: 48, deskWidth: '110%' },
    { rotacao: 6, deskRot: 3, padding: 36, deskWidth: '105%' },
    { rotacao: 4, deskRot: 2, padding: 24, deskWidth: '105%' },
    { rotacao: 2, deskRot: 1, padding: 12, deskWidth: '105%' },
    { rotacao: 0, deskRot: 0, padding: 0, deskWidth: '105%' },
    { rotacao: 0, deskRot: 0, padding: 0, deskWidth: '105%' },
] as const;

export interface ParFileirasHtml {
    indice: number;
    paddingPx: number;
    esquerda: AssentoPlenario[];
    direita: AssentoPlenario[];
    rotacaoEsq: number;
    rotacaoDir: number;
    deskRotEsq: number;
    deskRotDir: number;
    deskWidth: string;
}

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

/** Presidente da mesa (exclui vice-presidente). */
export function isPresidenteMesa(cargo?: string): boolean {
    if (!cargo) return false;
    const c = cargo.toLowerCase();
    if (c.includes('vice')) return false;
    return c.includes('presidente');
}

function isVicePresidenteMesa(cargo?: string): boolean {
    if (!cargo) return false;
    const c = cargo.toLowerCase();
    return c.includes('vice') && c.includes('president');
}

function isSecretarioMesa(cargo: string, ordem: '1' | '2'): boolean {
    const c = cargo.toLowerCase();
    const marcadores =
        ordem === '1'
            ? ['1º', '1o', 'primeiro', 'primeira']
            : ['2º', '2o', 'segundo', 'segunda'];
    return marcadores.some((m) => c.includes(m)) && c.includes('secret');
}

function ocuparSlot(
    slots: AssentoPlenario[],
    indice: number,
    membro: PresencaParlamentar | null,
    usados: Set<string>,
): void {
    if (!membro || usados.has(membro.parliamentarianId) || slots[indice]) return;
    slots[indice] = membro;
    usados.add(membro.parliamentarianId);
}

function pegarPorCargo(
    membros: PresencaParlamentar[],
    usados: Set<string>,
    pred: (cargo: string) => boolean,
): PresencaParlamentar | null {
    return (
        membros.find(
            (m) => !usados.has(m.parliamentarianId) && pred(m.cargoMesa ?? ''),
        ) ?? null
    );
}

/**
 * Disposição visual da mesa (5 cadeiras): presidente sempre no centro.
 * [2º Sec | 1º Sec | Presidente | Vice | vago/extra]
 */
export function ordenarAssentosMesaVisual(membros: PresencaParlamentar[]): AssentoPlenario[] {
    const total = PLENARIO_CAPACIDADE.mesaCadeiras;
    const slots: AssentoPlenario[] = Array.from({ length: total }, () => null);
    const centro = Math.floor(total / 2);
    const usados = new Set<string>();

    ocuparSlot(
        slots,
        centro,
        pegarPorCargo(membros, usados, isPresidenteMesa),
        usados,
    );
    ocuparSlot(
        slots,
        0,
        pegarPorCargo(membros, usados, (c) => isSecretarioMesa(c, '2')),
        usados,
    );
    ocuparSlot(
        slots,
        1,
        pegarPorCargo(membros, usados, (c) => isSecretarioMesa(c, '1')),
        usados,
    );
    ocuparSlot(
        slots,
        3,
        pegarPorCargo(membros, usados, isVicePresidenteMesa),
        usados,
    );

    const restantes = membros.filter((m) => !usados.has(m.parliamentarianId));
    let r = 0;
    for (let i = 0; i < total && r < restantes.length; i++) {
        if (!slots[i]) {
            ocuparSlot(slots, i, restantes[r++], usados);
        }
    }

    return slots;
}

/** Preenche a mesa diretora até 5 cadeiras com presidente no centro. */
export function preencherMesa(membros: PresencaParlamentar[]): AssentoPlenario[] {
    return ordenarAssentosMesaVisual(membros);
}

function preencherLado(membros: PresencaParlamentar[]): AssentoPlenario[] {
    const { fileiras, assentosPorFileira } = PLENARIO_CAPACIDADE;
    const capacidade = fileiras * assentosPorFileira;
    const slots: AssentoPlenario[] = [...membros];
    while (slots.length < capacidade) slots.push(null);
    return slots.slice(0, capacidade);
}

/**
 * Agrupa vereadores em pares de fileiras curvas (esquerda/direita).
 * Completa com cadeiras vazias até 6×7 por lado.
 */
export function calcularParesFileiras(vereadores: PresencaParlamentar[]): ParFileirasHtml[] {
    const { fileiras, assentosPorFileira } = PLENARIO_CAPACIDADE;
    const metade = Math.ceil(vereadores.length / 2);
    const slotsE = preencherLado(vereadores.slice(0, metade));
    const slotsD = preencherLado(vereadores.slice(metade));

    const pares: ParFileirasHtml[] = [];

    for (let i = 0; i < fileiras; i++) {
        const cfg = FILEIRA_VISUAL[Math.min(i, FILEIRA_VISUAL.length - 1)];
        const start = i * assentosPorFileira;

        pares.push({
            indice: i,
            paddingPx: cfg.padding,
            esquerda: slotsE.slice(start, start + assentosPorFileira),
            direita: slotsD.slice(start, start + assentosPorFileira),
            rotacaoEsq: cfg.rotacao,
            rotacaoDir: -cfg.rotacao,
            deskRotEsq: -cfg.deskRot,
            deskRotDir: cfg.deskRot,
            deskWidth: cfg.deskWidth,
        });
    }

    return pares;
}

export function abreviarNome(nome: string): string {
    const p = nome.trim().split(/\s+/);
    if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
    return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

/** @deprecated mantido para compatibilidade */
export function distribuirFileiras(total: number): number[] {
    const n = Math.min(PLENARIO_CAPACIDADE.fileiras, Math.max(1, Math.ceil(total / 2)));
    const base = Math.max(1, Math.floor(total / n));
    const fileiras = Array.from({ length: n }, () => base);
    let restante = total - base * n;
    for (let i = n - 1; i >= 0 && restante > 0; i--) {
        fileiras[i]++;
        restante--;
    }
    return fileiras;
}

/** @deprecated mantido para compatibilidade */
export function distribuirFileirasLado(total: number): number[] {
    return distribuirFileiras(total);
}
