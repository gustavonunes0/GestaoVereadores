import { Injectable } from '@nestjs/common';
import { SiglUserRepository } from '../../domain/repositories/sigl-user.repository';
import { UpdateUsuarioDto } from '../dto/usuario.dto';
import { SiglUserNotFoundError } from '../errors/auth.errors';
import { SiglUserViewModel } from '../view-models/sigl-user.view-model';

@Injectable()
export class UpdateSiglUserUseCase {
    constructor(private readonly siglUsers: SiglUserRepository) {}

    async execute(id: string, dto: UpdateUsuarioDto) {
        const user = await this.siglUsers.findById(id);
        if (!user) {
            throw new SiglUserNotFoundError();
        }

        const updated = await this.siglUsers.update(id, {
            nome: dto.nome,
            role: dto.role,
            ativo: dto.ativo,
        });

        return SiglUserViewModel.toHttp(updated);
    }
}
