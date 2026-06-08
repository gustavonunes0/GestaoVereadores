export class UserCpfAlreadyInUseError extends Error {
    constructor(cpf: string) {
        super(`Já existe um usuário com o CPF ${cpf}`);
    }
}
