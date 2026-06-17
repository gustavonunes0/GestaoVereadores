import { Injectable } from '@nestjs/common';
import { ListNormasQueryDto } from '../../../controle-juridico/normas/application/dto/list-normas-query.dto';
import { ListPublicNormasUseCase } from '../../../controle-juridico/normas/application/use-cases/list-public-normas.use-case';
import { ResolvePortalTenantUseCase } from './resolve-portal-tenant.use-case';

@Injectable()
export class ListPublicPortalNormasUseCase {
    constructor(
        private readonly resolvePortalTenant: ResolvePortalTenantUseCase,
        private readonly listPublicNormas: ListPublicNormasUseCase,
    ) {}

    async execute(slug: string, query: ListNormasQueryDto) {
        const record = await this.resolvePortalTenant.execute(slug);
        if (!record.portal.secoes.normas) {
            return { data: [], meta: { total: 0, page: 1, limit: query.limit ?? 20 } };
        }
        return this.listPublicNormas.execute(record.tenantId, query);
    }
}
