import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../../users/domain/user.repository';
import { USER_REPOSITORY } from '../../../users/users.tokens';
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
        @Inject(USER_REPOSITORY)
        private readonly userRepo: UserRepository,
    ) {}

    async execute(tenantId: string, query: ListTenantPartnersQueryDto) {
        const result = await this.partnerRepo.findMany(tenantId, {
            nome: query.nome,
            page: query.page,
            limit: query.limit,
        });
        const partnerIds = result.data.map((p) => p.id);
        const links = await this.partnerUserRepo.findLinksByPartnerIds(partnerIds);
        const userIdByPartnerId = new Map(
            links.map((link) => [link.tenantPartnerId, link.userId]),
        );
        const uniqueUserIds = [...new Set(links.map((link) => link.userId))];
        const usersById = new Map<string, Awaited<ReturnType<UserRepository['findById']>>>();
        for (const userId of uniqueUserIds) {
            const user = await this.userRepo.findById(userId);
            if (user) usersById.set(userId, user);
        }

        return {
            data: result.data.map((p) => {
                const userId = userIdByPartnerId.get(p.id);
                const user = userId ? usersById.get(userId) : undefined;
                return TenantPartnerViewModel.toHttp(p, {
                    usuarioVinculado: !!userId,
                    usuario: user ? TenantPartnerViewModel.userToHttp(user) : null,
                });
            }),
            meta: result.meta,
        };
    }
}
