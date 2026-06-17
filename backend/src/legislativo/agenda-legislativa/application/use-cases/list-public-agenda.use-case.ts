import { Inject, Injectable } from '@nestjs/common';
import { AgendaEventType } from '../../domain/enums/agenda-event-type.enum';
import { AgendaLegislativaRepository } from '../../domain/repositories/agenda-legislativa.repository';
import { AGENDA_LEGISLATIVA_REPOSITORY } from '../../agenda-legislativa.tokens';
import { FilterAgendaDto } from '../dto/agenda.dto';
import { AgendaViewModel } from '../view-models/agenda.view-model';

@Injectable()
export class ListPublicAgendaUseCase {
    constructor(
        @Inject(AGENDA_LEGISLATIVA_REPOSITORY)
        private readonly repository: AgendaLegislativaRepository,
    ) {}

    async execute(tenantId: string, query: FilterAgendaDto) {
        const result = await this.repository.findPublic(tenantId, {
            tipo: query.tipo as AgendaEventType | undefined,
            dataInicioDe: query.dataInicioDe ? new Date(query.dataInicioDe) : undefined,
            dataInicioAte: query.dataInicioAte ? new Date(query.dataInicioAte) : undefined,
            page: query.page,
            limit: query.limit,
        });

        return {
            data: result.data.map((item) => AgendaViewModel.toHttp(item)),
            meta: result.meta,
        };
    }
}
