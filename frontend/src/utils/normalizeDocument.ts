/** Strip non-digits for CPF/CNPJ before API POST when backend expects digits only. */
export function digitsOnly(value: string): string {
    return value.replace(/\D/g, '');
}
