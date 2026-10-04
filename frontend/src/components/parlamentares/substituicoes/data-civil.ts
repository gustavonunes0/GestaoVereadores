/** Datas civis (AAAA-MM-DD) sem conversão de fuso, para não deslocar o dia. */
export function dataCivilParaDate(valor: string | null | undefined): Date | null {
    if (!valor) return null;
    const [ano, mes, dia] = valor.slice(0, 10).split('-').map(Number);
    return new Date(ano, mes - 1, dia);
}

export function dateParaDataCivil(data: Date | null | undefined): string | null {
    if (!data) return null;
    const mm = String(data.getMonth() + 1).padStart(2, '0');
    const dd = String(data.getDate()).padStart(2, '0');
    return `${data.getFullYear()}-${mm}-${dd}`;
}

export function formatarDataCivil(valor: string | null | undefined): string {
    if (!valor) return '—';
    const [ano, mes, dia] = valor.slice(0, 10).split('-');
    return `${dia}/${mes}/${ano}`;
}
