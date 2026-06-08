import { Module } from '@nestjs/common';
import { AtosController } from './application/controllers/atos.controller';
import { CreateAtoUseCase } from './application/use-cases/create-ato.use-case';
import { GetAtoByIdUseCase } from './application/use-cases/get-ato-by-id.use-case';
import { ListAtosUseCase } from './application/use-cases/list-atos.use-case';
import { RemoveAtoUseCase } from './application/use-cases/remove-ato.use-case';
import { UpdateAtoUseCase } from './application/use-cases/update-ato.use-case';
import { AtoRepository } from './domain/repositories/ato.repository';
import { PrismaAtoRepository } from './infra/prisma/prisma-ato.repository';

@Module({
    controllers: [AtosController],
    providers: [
        CreateAtoUseCase,
        ListAtosUseCase,
        GetAtoByIdUseCase,
        UpdateAtoUseCase,
        RemoveAtoUseCase,
        {
            provide: AtoRepository,
            useClass: PrismaAtoRepository,
        },
    ],
    exports: [AtoRepository],
})
export class AtosModule {}
