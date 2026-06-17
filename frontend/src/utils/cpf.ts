export function normalizeCpf(value: string): string {
    let digits = value.replace(/\D/g, '');
    if (digits.length === 10) digits = `0${digits}`;
    return digits;
}

export function formatCpf(value: string): string {
    const cpf = normalizeCpf(value);
    if (cpf.length !== 11) return value;
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function isValidCpf(value: string): boolean {
    return normalizeCpf(value).length === 11;
}
