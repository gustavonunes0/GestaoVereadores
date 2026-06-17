/** Converte filtros de ano/mês/dia em intervalo ISO para a API. */
export function buildSessaoDataRange(params: {
    ano?: number;
    mes?: number;
    dia?: number;
    dataDe?: string;
    dataAte?: string;
}): { dataInicioDe?: string; dataInicioAte?: string } {
    const { ano, mes, dia, dataDe, dataAte } = params;
    if (dataDe || dataAte) {
        return {
            dataInicioDe: dataDe ? new Date(dataDe).toISOString() : undefined,
            dataInicioAte: dataAte
                ? new Date(`${dataAte}T23:59:59.999`).toISOString()
                : undefined,
        };
    }
    if (!ano) return {};
    if (mes && dia) {
        const start = new Date(ano, mes - 1, dia);
        const end = new Date(ano, mes - 1, dia, 23, 59, 59, 999);
        return {
            dataInicioDe: start.toISOString(),
            dataInicioAte: end.toISOString(),
        };
    }
    if (mes) {
        return {
            dataInicioDe: new Date(ano, mes - 1, 1).toISOString(),
            dataInicioAte: new Date(ano, mes, 0, 23, 59, 59, 999).toISOString(),
        };
    }
    return {
        dataInicioDe: new Date(ano, 0, 1).toISOString(),
        dataInicioAte: new Date(ano, 11, 31, 23, 59, 59, 999).toISOString(),
    };
}

export const MESES_OPCOES = [
    { value: '', label: '—' },
    ...Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: String(i + 1).padStart(2, '0'),
    })),
];

export function anosPesquisaSessao(quantidade = 8): number[] {
    const atual = new Date().getFullYear();
    return Array.from({ length: quantidade }, (_, i) => atual - i);
}
