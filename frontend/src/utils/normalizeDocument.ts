/** Strip non-digits for CPF/CNPJ before API POST when backend expects digits only. */
export function digitsOnly(value: string): string {
    return value.replace(/\D/g, '');
}

/** Formata progressivamente CPF (11) ou CNPJ (14) para exibição. */
export function formatCpfCnpj(value: string): string {
    const digits = digitsOnly(value).slice(0, 14);
    if (digits.length <= 11) {
        return digits
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return digits
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}
