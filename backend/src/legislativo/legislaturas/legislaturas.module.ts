import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { LegislaturesController } from './application/controllers/legislatures.controller';
import { CreateLegislatureUseCase } from './application/use-cases/create-legislature.use-case';
import { GetLegislatureByIdUseCase } from './application/use-cases/get-legislature-by-id.use-case';
import { ListLegislaturesUseCase } from './application/use-cases/list-legislatures.use-case';
import { RemoveLegislatureUseCase } from './application/use-cases/remove-legislature.use-case';
import { UpdateLegislatureUseCase } from './application/use-cases/update-legislature.use-case';
import { PrismaLegislatureRepository } from './infra/prisma/prisma-legislature.repository';
import { LEGISLATURE_REPOSITORY } from './legislaturas.tokens';

@Module({
    imports: [PrismaModule],
    controllers: [LegislaturesController],
    providers: [
        CreateLegislatureUseCase,
        ListLegislaturesUseCase,
        GetLegislatureByIdUseCase,
        UpdateLegislatureUseCase,
        RemoveLegislatureUseCase,
        PrismaLegislatureRepository,
        {
            provide: LEGISLATURE_REPOSITORY,
            useExisting: PrismaLegislatureRepository,
        },
    ],
    exports: [LEGISLATURE_REPOSITORY],
})
export class LegislaturasModule {}
