export class GuestUserNotFoundError extends Error {
    constructor(_id: string) {
        super('Convidado não encontrado');
        this.name = 'GuestUserNotFoundError';
    }
}
