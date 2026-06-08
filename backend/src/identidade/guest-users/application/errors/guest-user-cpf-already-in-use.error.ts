export class GuestUserCpfAlreadyInUseError extends Error {
    constructor(cpf: string) {
        super(`CPF ${cpf} já está em uso neste tenant`);
        this.name = 'GuestUserCpfAlreadyInUseError';
    }
}
