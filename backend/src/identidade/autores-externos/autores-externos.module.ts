import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AUTOR_EXTERNO_REPOSITORY } from './autores-externos.tokens';
import { AutoresExternosController } from './application/controllers/autores-externos.controller';
import { CreateAutorExternoUseCase } from './application/use-cases/create-autor-externo.use-case';
import { GetAutorExternoByIdUseCase } from './application/use-cases/get-autor-externo-by-id.use-case';
import { ListAutorExternoMateriasUseCase } from './application/use-cases/list-autor-externo-materias.use-case';
import { ListAutoresExternosIdentidadeUseCase } from './application/use-cases/list-autores-externos.use-case';
import { RemoveAutorExternoUseCase } from './application/use-cases/remove-autor-externo.use-case';
import { UpdateAutorExternoUseCase } from './application/use-cases/update-autor-externo.use-case';
import { AutorExternoRepository } from './domain/repositories/autor-externo.repository';
import { PrismaAutorExternoRepository } from './infra/prisma/prisma-autor-externo.repository';

@Module({
    imports: [PrismaModule],
    controllers: [AutoresExternosController],
    providers: [
        CreateAutorExternoUseCase,
        ListAutoresExternosIdentidadeUseCase,
        GetAutorExternoByIdUseCase,
        UpdateAutorExternoUseCase,
        RemoveAutorExternoUseCase,
        ListAutorExternoMateriasUseCase,
        PrismaAutorExternoRepository,
        {
            provide: AUTOR_EXTERNO_REPOSITORY,
            useExisting: PrismaAutorExternoRepository,
        },
        {
            provide: AutorExternoRepository,
            useExisting: PrismaAutorExternoRepository,
        },
    ],
    exports: [AUTOR_EXTERNO_REPOSITORY, AutorExternoRepository],
})
export class AutoresExternosModule {}
