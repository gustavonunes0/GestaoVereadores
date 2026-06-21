import { Inject, Injectable } from '@nestjs/common';
import { TenantPartnerRepository } from '../../domain/repositories/tenant-partner.repository';
import { TenantPartnerUserRepository } from '../../domain/repositories/tenant-partner-user.repository';
import {
    TENANT_PARTNER_REPOSITORY,
    TENANT_PARTNER_USER_REPOSITORY,
} from '../../tenant-partners.tokens';
import { ListTenantPartnersQueryDto } from '../dto/list-tenant-partners-query.dto';
import { TenantPartnerViewModel } from '../view-models/tenant-partner.view-model';

@Injectable()
export class ListTenantPartnersUseCase {
    constructor(
        @Inject(TENANT_PARTNER_REPOSITORY)
        private readonly partnerRepo: TenantPartnerRepository,
        @Inject(TENANT_PARTNER_USER_REPOSITORY)
        private readonly partnerUserRepo: TenantPartnerUserRepository,
    ) {}

    async execute(tenantId: string, query: ListTenantPartnersQueryDto) {
        const result = await this.partnerRepo.findMany(tenantId, {
            nome: query.nome,
            page: query.page,
            limit: query.limit,
        });
        const linkedIds = new Set(
            await this.partnerUserRepo.findLinkedPartnerIds(
                result.data.map((p) => p.id),
            ),
        );
        return {
            data: result.data.map((p) =>
                TenantPartnerViewModel.toHttp(p, {
                    usuarioVinculado: linkedIds.has(p.id),
                }),
            ),
            meta: result.meta,
        };
    }
}
