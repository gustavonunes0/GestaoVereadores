import { Inject, Injectable } from '@nestjs/common';
import { PublicUserPrimitives, UserEntity } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';
import { PASSWORD_HASHER, USER_REPOSITORY } from '../../users.tokens';
import { PasswordHasher } from '../contracts/password-hasher';
import { CreateUserDto } from '../dtos/requests/createUser.requests';
import { UserCpfAlreadyInUseError } from '../errors/user-cpf-already-in-use.error';
import { UserEmailAlreadyInUseError } from '../errors/user-email-already-in-use.error';

@Injectable()
export class CreateUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
    ) {}

    async execute(dto: CreateUserDto): Promise<PublicUserPrimitives> {
        const normalizedEmail = dto.email.trim().toLowerCase();
        const normalizedCpf = dto.cpf.replace(/\D/g, '');

        const existingUserByEmail =
            await this.userRepository.findByEmail(normalizedEmail);
        if (existingUserByEmail) {
            throw new UserEmailAlreadyInUseError(normalizedEmail);
        }

        const existingUserByCpf =
            await this.userRepository.findByCpf(normalizedCpf);
        if (existingUserByCpf) {
            throw new UserCpfAlreadyInUseError(normalizedCpf);
        }

        const passwordHash = await this.passwordHasher.hash(dto.password);
        const user = UserEntity.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            cpf: normalizedCpf,
            email: normalizedEmail,
            passwordHash,
            profilePicture: dto.profilePicture,
        });

        const createdUser = await this.userRepository.create(user);
        return createdUser.toPublicPrimitives();
    }
}
