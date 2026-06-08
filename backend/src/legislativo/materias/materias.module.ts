import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MateriasController } from './application/controllers/materias.controller';
import { AddMateriaAutorUseCase } from './application/use-cases/add-materia-autor.use-case';
import { CreateMateriaUseCase } from './application/use-cases/create-materia.use-case';
import { ExecuteMatterTramitationUseCase } from './application/use-cases/execute-matter-tramitation.use-case';
import { GetMateriaByIdUseCase } from './application/use-cases/get-materia-by-id.use-case';
import { GetMatterAuthorshipUseCase } from './application/use-cases/get-matter-authorship.use-case';
import { GetMatterWorkflowUseCase } from './application/use-cases/get-matter-workflow.use-case';
import {
    AddMatterCoauthorUseCase,
    RemoveMatterCoauthorUseCase,
} from './application/use-cases/manage-matter-coauthors.use-case';
import { SetMatterAutorExternoUseCase } from './application/use-cases/set-matter-autor-externo.use-case';
import { SetMatterAutorParlamentarUseCase } from './application/use-cases/set-matter-autor-parlamentar.use-case';
import { SetMatterRelatorUseCase } from './application/use-cases/set-matter-relator.use-case';
import { ListMateriaAutoresUseCase } from './application/use-cases/list-materia-autores.use-case';
import { ListMateriasUseCase } from './application/use-cases/list-materias.use-case';
import { ListMatterStatusesUseCase } from './application/use-cases/list-matter-statuses.use-case';
import { ListMatterTramitationActionsUseCase } from './application/use-cases/list-matter-tramitation-actions.use-case';
import { RemoveMateriaAutorUseCase } from './application/use-cases/remove-materia-autor.use-case';
import { RemoveMateriaUseCase } from './application/use-cases/remove-materia.use-case';
import { UpdateMateriaUseCase } from './application/use-cases/update-materia.use-case';
import { MvpMatterCommitteeOpinionGate } from './infra/gates/mvp-matter-committee-opinion.gate';
import { PrismaMateriaRepository } from './infra/prisma/prisma-materia.repository';
import {
    MATERIA_REPOSITORY,
    MATTER_COMMITTEE_OPINION_GATE,
} from './materias.tokens';

@Module({
    imports: [PrismaModule],
    controllers: [MateriasController],
    providers: [
        CreateMateriaUseCase,
        ListMateriasUseCase,
        GetMateriaByIdUseCase,
        GetMatterWorkflowUseCase,
        ListMatterStatusesUseCase,
        UpdateMateriaUseCase,
        ExecuteMatterTramitationUseCase,
        ListMatterTramitationActionsUseCase,
        RemoveMateriaUseCase,
        ListMateriaAutoresUseCase,
        AddMateriaAutorUseCase,
        RemoveMateriaAutorUseCase,
        GetMatterAuthorshipUseCase,
        SetMatterAutorParlamentarUseCase,
        SetMatterAutorExternoUseCase,
        AddMatterCoauthorUseCase,
        RemoveMatterCoauthorUseCase,
        SetMatterRelatorUseCase,
        PrismaMateriaRepository,
        MvpMatterCommitteeOpinionGate,
        {
            provide: MATERIA_REPOSITORY,
            useExisting: PrismaMateriaRepository,
        },
        {
            provide: MATTER_COMMITTEE_OPINION_GATE,
            useExisting: MvpMatterCommitteeOpinionGate,
        },
    ],
    exports: [MATERIA_REPOSITORY, MATTER_COMMITTEE_OPINION_GATE],
})
export class MateriasModule {}
