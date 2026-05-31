export class UserNotFoundError extends Error {
    constructor(userId: string) {
        super(`Usuário com id ${userId} não foi encontrado`);
    }
}
