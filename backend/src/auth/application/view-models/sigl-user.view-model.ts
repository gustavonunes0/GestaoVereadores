import { SiglUserListItem } from '../../domain/repositories/sigl-user.repository';

export class SiglUserViewModel {
    static toHttp(user: SiglUserListItem) {
        return {
            id: user.id,
            username: user.username,
            nome: user.nome,
            role: user.role,
            ativo: user.ativo,
            ...(user.createdAt ? { createdAt: user.createdAt } : {}),
        };
    }
}
