import { Inject, Injectable } from '@nestjs/common';
import { toOptionalDate } from '../../../../common/prisma/date-fields';
import { AgendaEventType } from '../../domain/enums/agenda-event-type.enum';
import { AgendaLegislativaRepository } from '../../domain/repositories/agenda-legislativa.repository';
import { AgendaLegislativaDomainService } from '../../domain/services/agenda-legislativa-domain.service';
import { AGENDA_LEGISLATIVA_REPOSITORY } from '../../agenda-legislativa.tokens';
import { FilterAgendaDto } from '../dto/agenda.dto';
import { AgendaViewModel } from '../view-models/agenda.view-model';

@Injectable()
export class ListAgendasUseCase {
    private readonly domainService = new AgendaLegislativaDomainService();

    constructor(
        @Inject(AGENDA_LEGISLATIVA_REPOSITORY)
        private readonly repository: AgendaLegislativaRepository,
    ) {}

    async execute(tenantId: string, filters: FilterAgendaDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        const result = await this.repository.findAll(tenantId, {
            tipo: filters.tipo as AgendaEventType | undefined,
            dataInicioDe: toOptionalDate(filters.dataInicioDe) ?? null,
            dataInicioAte: toOptionalDate(filters.dataInicioAte) ?? null,
            page: filters.page,
            limit: filters.limit,
        });

        return {
            data: result.data.map((item) => AgendaViewModel.toHttp(item)),
            meta: result.meta,
        };
    }
}
