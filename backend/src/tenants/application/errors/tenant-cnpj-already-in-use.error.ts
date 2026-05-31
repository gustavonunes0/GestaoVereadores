export class TenantCnpjAlreadyInUseError extends Error {
    constructor(cnpj: string) {
        super(`Já existe um tenant com o CNPJ ${cnpj}`);
    }
}
