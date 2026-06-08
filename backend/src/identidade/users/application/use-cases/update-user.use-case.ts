import { Inject, Injectable } from '@nestjs/common';
import { PublicUserPrimitives } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';
import { PASSWORD_HASHER, USER_REPOSITORY } from '../../users.tokens';
import { PasswordHasher } from '../contracts/password-hasher';
import { UpdateUserDto } from '../dtos/requests/updateUser.requests';
import { UserCpfAlreadyInUseError } from '../errors/user-cpf-already-in-use.error';
import { UserEmailAlreadyInUseError } from '../errors/user-email-already-in-use.error';
import { UserNotFoundError } from '../errors/user-not-found.error';

@Injectable()
export class UpdateUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
    ) {}

    async execute(
        id: string,
        dto: UpdateUserDto,
    ): Promise<PublicUserPrimitives> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new UserNotFoundError(id);
        }

        if (dto.email) {
            const normalizedEmail = dto.email.trim().toLowerCase();
            const userWithSameEmail =
                await this.userRepository.findByEmail(normalizedEmail);
            if (userWithSameEmail && userWithSameEmail.id !== id) {
                throw new UserEmailAlreadyInUseError(normalizedEmail);
            }
            dto.email = normalizedEmail;
        }

        if (dto.cpf) {
            const normalizedCpf = dto.cpf.replace(/\D/g, '');
            const userWithSameCpf =
                await this.userRepository.findByCpf(normalizedCpf);
            if (userWithSameCpf && userWithSameCpf.id !== id) {
                throw new UserCpfAlreadyInUseError(normalizedCpf);
            }
            dto.cpf = normalizedCpf;
        }

        const passwordHash = dto.password
            ? await this.passwordHasher.hash(dto.password)
            : undefined;

        user.update({
            firstName: dto.firstName,
            lastName: dto.lastName,
            cpf: dto.cpf,
            email: dto.email,
            passwordHash,
            profilePicture: dto.profilePicture,
        });

        const updatedUser = await this.userRepository.update(user);
        return updatedUser.toPublicPrimitives();
    }
}
