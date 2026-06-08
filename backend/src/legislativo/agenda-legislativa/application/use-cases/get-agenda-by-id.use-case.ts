import { Inject, Injectable } from '@nestjs/common';
import { AgendaLegislativaRepository } from '../../domain/repositories/agenda-legislativa.repository';
import { AgendaLegislativaDomainService } from '../../domain/services/agenda-legislativa-domain.service';
import { AGENDA_LEGISLATIVA_REPOSITORY } from '../../agenda-legislativa.tokens';
import { AgendaNotFoundError } from '../errors/agenda.errors';
import { AgendaViewModel } from '../view-models/agenda.view-model';

@Injectable()
export class GetAgendaByIdUseCase {
    private readonly domainService = new AgendaLegislativaDomainService();

    constructor(
        @Inject(AGENDA_LEGISLATIVA_REPOSITORY)
        private readonly repository: AgendaLegislativaRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        this.domainService.assertTenantIdProvided(tenantId);

        const item = await this.repository.findOne(tenantId, id);
        if (!item) throw new AgendaNotFoundError();

        return AgendaViewModel.toHttp(item);
    }
}
