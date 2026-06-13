import { Injectable } from '@nestjs/common';
import { SiglPasswordHasher } from '../../domain/contracts/sigl-password.hasher';
import { SiglUserRepository } from '../../domain/repositories/sigl-user.repository';
import { CreateUsuarioDto } from '../dto/usuario.dto';
import { SiglUsernameAlreadyInUseError } from '../errors/auth.errors';
import { SiglUserViewModel } from '../view-models/sigl-user.view-model';

@Injectable()
export class CreateSiglUserUseCase {
    constructor(
        private readonly siglUsers: SiglUserRepository,
        private readonly passwordHasher: SiglPasswordHasher,
    ) {}

    async execute(dto: CreateUsuarioDto) {
        const exists = await this.siglUsers.existsByUsername(dto.username);
        if (exists) {
            throw new SiglUsernameAlreadyInUseError();
        }

        const passwordHash = await this.passwordHasher.hash(dto.password);
        const created = await this.siglUsers.create({
            username: dto.username,
            passwordHash,
            nome: dto.nome,
            role: dto.role,
        });

        return SiglUserViewModel.toHttp(created);
    }
}
