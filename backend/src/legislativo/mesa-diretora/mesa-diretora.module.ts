import { Module } from '@nestjs/common';
import { LegislaturasModule } from '../legislaturas/legislaturas.module';
import { ParlamentaresModule } from '../parlamentares/parlamentares.module';
import { MesaDiretoraController } from './application/controllers/mesa-diretora.controller';
import { AddMesaDiretoraMembroUseCase } from './application/use-cases/add-mesa-diretora-membro.use-case';
import { CreateCargoMesaUseCase } from './application/use-cases/create-cargo-mesa.use-case';
import { CreateMesaDiretoraUseCase } from './application/use-cases/create-mesa-diretora.use-case';
import { GetMesaDiretoraByIdUseCase } from './application/use-cases/get-mesa-diretora-by-id.use-case';
import { ListCargosMesaUseCase } from './application/use-cases/list-cargos-mesa.use-case';
import { ListMesaDiretoraUseCase } from './application/use-cases/list-mesa-diretora.use-case';
import { RemoveMesaDiretoraMembroUseCase } from './application/use-cases/remove-mesa-diretora-membro.use-case';
import { UpdateMesaDiretoraUseCase } from './application/use-cases/update-mesa-diretora.use-case';
import { PrismaBoardRepository } from './infra/prisma/prisma-board.repository';
import { BOARD_REPOSITORY } from './mesa-diretora.tokens';

@Module({
    imports: [LegislaturasModule, ParlamentaresModule],
    controllers: [MesaDiretoraController],
    providers: [
        CreateMesaDiretoraUseCase,
        ListMesaDiretoraUseCase,
        GetMesaDiretoraByIdUseCase,
        UpdateMesaDiretoraUseCase,
        AddMesaDiretoraMembroUseCase,
        RemoveMesaDiretoraMembroUseCase,
        ListCargosMesaUseCase,
        CreateCargoMesaUseCase,
        PrismaBoardRepository,
        {
            provide: BOARD_REPOSITORY,
            useExisting: PrismaBoardRepository,
        },
    ],
    exports: [BOARD_REPOSITORY],
})
export class MesaDiretoraModule {}
