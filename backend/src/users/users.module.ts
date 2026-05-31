import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { FindAllUsersUseCase } from './application/use-cases/find-all-users.use-case';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { UsersController } from './infra/controllers/users.controller';
import { PrismaUserRepository } from './infra/database/prisma-user.repository';
import { ScryptPasswordHasher } from './infra/security/scrypt-password-hasher';
import { PASSWORD_HASHER, USER_REPOSITORY } from './users.tokens';

@Module({
    controllers: [UsersController],
    providers: [
        CreateUserUseCase,
        FindAllUsersUseCase,
        FindUserByIdUseCase,
        UpdateUserUseCase,
        DeleteUserUseCase,
        PrismaUserRepository,
        ScryptPasswordHasher,
        {
            provide: USER_REPOSITORY,
            useExisting: PrismaUserRepository,
        },
        {
            provide: PASSWORD_HASHER,
            useExisting: ScryptPasswordHasher,
        },
    ],
    exports: [USER_REPOSITORY, PASSWORD_HASHER],
})
export class UsersModule {}
