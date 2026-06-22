export interface MateriaParaIdentificacao {
    tipoMateria?: { sigla?: string | null; nome?: string | null } | null;
    tipo?: { sigla?: string | null; nome?: string | null } | null;
    sigla?: string | null;
    numero?: string | number | null;
    ano?: number | { valor: number } | null;
}

function getSigla(m: MateriaParaIdentificacao): string {
    return (m.tipoMateria?.sigla ?? m.tipo?.sigla ?? m.sigla ?? '').trim();
}

function getNumero(m: MateriaParaIdentificacao): string {
    if (m.numero == null || m.numero === '') return '';
    return String(m.numero);
}

function getAno(m: MateriaParaIdentificacao): number | null {
    if (m.ano == null) return null;
    if (typeof m.ano === 'number') return m.ano;
    return (m.ano as { valor: number }).valor;
}

export type NumeroAnoParseResult =
    | { ok: true; numero: number; ano: number }
    | { ok: false; message: string };

/** Interpreta "85/2026" ou "85 / 2026". */
export function parseNumeroAnoMateria(raw: string): NumeroAnoParseResult {
    const trimmed = raw.trim();
    if (!trimmed) {
        return { ok: false, message: 'Informe o número no formato 85/2026.' };
    }

    const match = trimmed.match(/^(\d+)\s*\/\s*(\d{4})$/);
    if (!match) {
        return { ok: false, message: 'Use o formato número/ano, ex.: 85/2026.' };
    }

    const numero = Number(match[1]);
    const ano = Number(match[2]);

    if (!Number.isFinite(numero) || numero <= 0) {
        return { ok: false, message: 'O número deve ser maior que zero.' };
    }
    if (!Number.isFinite(ano) || ano < 1900 || ano > 2100) {
        return { ok: false, message: 'Ano inválido.' };
    }

    return { ok: true, numero, ano };
}

export function formatNumeroAnoInput(
    numero: string | number | null | undefined,
    ano: number | null | undefined,
): string {
    if (numero == null || numero === '' || ano == null) return '';
    return `${numero}/${ano}`;
}

export function resolveAnoIdByValor(
    anos: Array<{ id: string; valor: number }>,
    anoValor: number,
): string | null {
    return anos.find((a) => a.valor === anoValor)?.id ?? null;
}

/** "REQ 83/2026" */
export function formatarIdentificacao(m: MateriaParaIdentificacao): string {
    const sigla = getSigla(m);
    const numero = getNumero(m);
    const ano = getAno(m);
    if (!sigla && !numero) return 'Matéria';
    if (!numero) return sigla;
    return `${sigla} ${numero}/${ano ?? '?'}`;
}

/** "REQ 83/2026 — REQUERIMENTO LEGISLATIVO" */
export function formatarIdentificacaoCompleta(m: MateriaParaIdentificacao): string {
    const id = formatarIdentificacao(m);
    const nome = (m.tipoMateria?.nome ?? m.tipo?.nome ?? '').trim().toUpperCase();
    if (!nome) return id;
    return `${id} — ${nome}`;
}
