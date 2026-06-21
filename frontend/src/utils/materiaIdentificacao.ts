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
