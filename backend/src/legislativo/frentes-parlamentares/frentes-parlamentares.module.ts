import { Module } from '@nestjs/common';
import { TenantUsersModule } from '../../identidade/tenant-users/tenant-users.module';
import { ParlamentaresModule } from '../parlamentares/parlamentares.module';
import { FrentesController } from './application/controllers/frentes.controller';
import { AddFrenteMembroUseCase } from './application/use-cases/add-frente-membro.use-case';
import { CreateFrenteUseCase } from './application/use-cases/create-frente.use-case';
import { GetFrenteByIdUseCase } from './application/use-cases/get-frente-by-id.use-case';
import { ListFrentesUseCase } from './application/use-cases/list-frentes.use-case';
import { RemoveFrenteMembroUseCase } from './application/use-cases/remove-frente-membro.use-case';
import { RemoveFrenteUseCase } from './application/use-cases/remove-frente.use-case';
import { UpdateFrenteUseCase } from './application/use-cases/update-frente.use-case';
import { PARLIAMENTARY_FRONT_REPOSITORY } from './frentes-parlamentares.tokens';
import { PrismaParliamentaryFrontRepository } from './infra/prisma/prisma-parliamentary-front.repository';

@Module({
    imports: [ParlamentaresModule, TenantUsersModule],
    controllers: [FrentesController],
    providers: [
        CreateFrenteUseCase,
        ListFrentesUseCase,
        GetFrenteByIdUseCase,
        UpdateFrenteUseCase,
        RemoveFrenteUseCase,
        AddFrenteMembroUseCase,
        RemoveFrenteMembroUseCase,
        PrismaParliamentaryFrontRepository,
        {
            provide: PARLIAMENTARY_FRONT_REPOSITORY,
            useExisting: PrismaParliamentaryFrontRepository,
        },
    ],
    exports: [PARLIAMENTARY_FRONT_REPOSITORY],
})
export class FrentesParlamentaresModule {}
