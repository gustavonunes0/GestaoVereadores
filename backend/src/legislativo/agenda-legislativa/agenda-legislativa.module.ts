import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AGENDA_LEGISLATIVA_REPOSITORY } from './agenda-legislativa.tokens';
import { AgendaController } from './application/controllers/agenda.controller';
import { CreateAgendaUseCase } from './application/use-cases/create-agenda.use-case';
import { GetAgendaByIdUseCase } from './application/use-cases/get-agenda-by-id.use-case';
import { ListAgendaTiposUseCase } from './application/use-cases/list-agenda-tipos.use-case';
import { ListAgendasUseCase } from './application/use-cases/list-agendas.use-case';
import { RemoveAgendaUseCase } from './application/use-cases/remove-agenda.use-case';
import { UpdateAgendaUseCase } from './application/use-cases/update-agenda.use-case';
import { PrismaAgendaLegislativaRepository } from './infra/prisma/prisma-agenda-legislativa.repository';

@Module({
    imports: [PrismaModule],
    controllers: [AgendaController],
    providers: [
        CreateAgendaUseCase,
        ListAgendasUseCase,
        ListAgendaTiposUseCase,
        GetAgendaByIdUseCase,
        UpdateAgendaUseCase,
        RemoveAgendaUseCase,
        PrismaAgendaLegislativaRepository,
        {
            provide: AGENDA_LEGISLATIVA_REPOSITORY,
            useExisting: PrismaAgendaLegislativaRepository,
        },
    ],
    exports: [AGENDA_LEGISLATIVA_REPOSITORY],
})
export class AgendaLegislativaModule {}
