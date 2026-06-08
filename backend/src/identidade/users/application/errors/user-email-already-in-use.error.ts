export class UserEmailAlreadyInUseError extends Error {
    constructor(email: string) {
        super(`Já existe um usuário com o e-mail ${email}`);
    }
}
