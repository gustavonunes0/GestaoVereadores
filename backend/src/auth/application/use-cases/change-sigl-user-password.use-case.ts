import { Injectable } from '@nestjs/common';
import { SiglPasswordHasher } from '../../domain/contracts/sigl-password.hasher';
import { SiglUserRepository } from '../../domain/repositories/sigl-user.repository';
import { ChangePasswordDto } from '../dto/usuario.dto';
import {
    InvalidCurrentPasswordError,
    SiglUserNotFoundError,
} from '../errors/auth.errors';

@Injectable()
export class ChangeSiglUserPasswordUseCase {
    constructor(
        private readonly siglUsers: SiglUserRepository,
        private readonly passwordHasher: SiglPasswordHasher,
    ) {}

    async execute(userId: string, dto: ChangePasswordDto) {
        const user = await this.siglUsers.findById(userId);
        if (!user) {
            throw new SiglUserNotFoundError();
        }

        const valid = await this.passwordHasher.compare(
            dto.currentPassword,
            user.passwordHash,
        );
        if (!valid) {
            throw new InvalidCurrentPasswordError();
        }

        const passwordHash = await this.passwordHasher.hash(dto.newPassword);
        await this.siglUsers.updatePassword(userId, passwordHash);

        return { message: 'Senha alterada com sucesso' };
    }
}
