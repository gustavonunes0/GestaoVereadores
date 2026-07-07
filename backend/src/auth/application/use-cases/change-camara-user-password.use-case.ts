import { Inject, Injectable } from '@nestjs/common';
import { PasswordHasher } from '../../../identidade/users/application/contracts/password-hasher';
import { UserRepository } from '../../../identidade/users/domain/user.repository';
import {
    PASSWORD_HASHER,
    USER_REPOSITORY,
} from '../../../identidade/users/users.tokens';
import { UserNotFoundError } from '../../../identidade/users/application/errors/user-not-found.error';
import { ChangeCamaraPasswordDto } from '../dto/change-camara-password.dto';
import { InvalidCurrentPasswordError } from '../errors/auth.errors';

@Injectable()
export class ChangeCamaraUserPasswordUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
    ) {}

    async execute(userId: string, dto: ChangeCamaraPasswordDto) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new UserNotFoundError(userId);
        }

        const { passwordHash } = user.toPrimitives();
        const valid = await this.passwordHasher.compare(
            dto.currentPassword,
            passwordHash,
        );
        if (!valid) {
            throw new InvalidCurrentPasswordError();
        }

        const newHash = await this.passwordHasher.hash(dto.newPassword);
        user.update({ passwordHash: newHash });
        await this.userRepository.update(user);

        return { message: 'Senha alterada com sucesso' };
    }
}
