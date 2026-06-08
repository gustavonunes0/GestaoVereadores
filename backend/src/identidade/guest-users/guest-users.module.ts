import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { GuestUsersController } from './application/controllers/guest-users.controller';
import { CreateGuestUserUseCase } from './application/use-cases/create-guest-user.use-case';
import { GetGuestUserByIdUseCase } from './application/use-cases/get-guest-user-by-id.use-case';
import { ListGuestUsersUseCase } from './application/use-cases/list-guest-users.use-case';
import { RemoveGuestUserUseCase } from './application/use-cases/remove-guest-user.use-case';
import { UpdateGuestUserUseCase } from './application/use-cases/update-guest-user.use-case';
import { GUEST_USER_REPOSITORY } from './guest-users.tokens';
import { PrismaGuestUserRepository } from './infra/prisma/prisma-guest-user.repository';

@Module({
    imports: [PrismaModule],
    controllers: [GuestUsersController],
    providers: [
        CreateGuestUserUseCase,
        ListGuestUsersUseCase,
        GetGuestUserByIdUseCase,
        UpdateGuestUserUseCase,
        RemoveGuestUserUseCase,
        PrismaGuestUserRepository,
        {
            provide: GUEST_USER_REPOSITORY,
            useExisting: PrismaGuestUserRepository,
        },
    ],
    exports: [GUEST_USER_REPOSITORY],
})
export class GuestUsersModule {}
