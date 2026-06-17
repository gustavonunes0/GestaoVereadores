import { Injectable } from '@nestjs/common';
import { FilterAgendaDto } from '../../../legislativo/agenda-legislativa/application/dto/agenda.dto';
import { ListPublicAgendaUseCase } from '../../../legislativo/agenda-legislativa/application/use-cases/list-public-agenda.use-case';
import { PublicPortalConfigViewModel } from '../view-models/portal-config.view-model';
import { ResolvePortalTenantUseCase } from './resolve-portal-tenant.use-case';

@Injectable()
export class GetPublicPortalConfigUseCase {
    constructor(
        private readonly resolvePortalTenant: ResolvePortalTenantUseCase,
    ) {}

    async execute(slug: string) {
        const record = await this.resolvePortalTenant.execute(slug);
        return PublicPortalConfigViewModel.toHttp(record);
    }
}

@Injectable()
export class ListPublicPortalAgendaUseCase {
    constructor(
        private readonly resolvePortalTenant: ResolvePortalTenantUseCase,
        private readonly listPublicAgenda: ListPublicAgendaUseCase,
    ) {}

    async execute(slug: string, query: FilterAgendaDto) {
        const record = await this.resolvePortalTenant.execute(slug);
        if (!record.portal.secoes.agenda) {
            return { data: [], meta: { total: 0, page: 1, limit: query.limit ?? 20 } };
        }
        return this.listPublicAgenda.execute(record.tenantId, query);
    }
}
