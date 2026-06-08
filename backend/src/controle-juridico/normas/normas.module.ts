import { Module } from '@nestjs/common';
import { NormasController } from './application/controllers/normas.controller';
import { CreateNormaUseCase } from './application/use-cases/create-norma.use-case';
import { GetNormaByIdUseCase } from './application/use-cases/get-norma-by-id.use-case';
import { ListNormasUseCase } from './application/use-cases/list-normas.use-case';
import { RemoveNormaUseCase } from './application/use-cases/remove-norma.use-case';
import { UpdateNormaUseCase } from './application/use-cases/update-norma.use-case';
import { NormaRepository } from './domain/repositories/norma.repository';
import { MateriaOrigemValidator } from './infra/integrations/materia-origem-validator';
import { PrismaNormaRepository } from './infra/prisma/prisma-norma.repository';

@Module({
    controllers: [NormasController],
    providers: [
        CreateNormaUseCase,
        ListNormasUseCase,
        GetNormaByIdUseCase,
        UpdateNormaUseCase,
        RemoveNormaUseCase,
        MateriaOrigemValidator,
        {
            provide: NormaRepository,
            useClass: PrismaNormaRepository,
        },
    ],
    exports: [NormaRepository],
})
export class NormasModule {}
