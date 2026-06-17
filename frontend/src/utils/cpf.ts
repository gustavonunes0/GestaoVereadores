export function normalizeCpf(value: string): string {
    return value.replace(/\D/g, '');
}

export function isValidCpf(value: string): boolean {
    const cpf = normalizeCpf(value);
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i += 1) {
        sum += Number.parseInt(cpf.charAt(i), 10) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== Number.parseInt(cpf.charAt(9), 10)) return false;

    sum = 0;
    for (let i = 0; i < 10; i += 1) {
        sum += Number.parseInt(cpf.charAt(i), 10) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    return remainder === Number.parseInt(cpf.charAt(10), 10);
}
