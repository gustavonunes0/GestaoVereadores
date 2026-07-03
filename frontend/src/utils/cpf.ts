export function normalizeCpf(value: string): string {
    let digits = value.replace(/\D/g, '');
    if (digits.length === 10) digits = `0${digits}`;
    return digits;
}

export function formatCpf(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function isValidCpf(value: string): boolean {
    return value.replace(/\D/g, '').length === 11;
}
