import { Inject, Injectable } from '@nestjs/common';
import { TenantPartnerRepository } from '../../domain/repositories/tenant-partner.repository';
import { TenantPartnerUserRepository } from '../../domain/repositories/tenant-partner-user.repository';
import {
    TENANT_PARTNER_REPOSITORY,
    TENANT_PARTNER_USER_REPOSITORY,
} from '../../tenant-partners.tokens';
import { TenantPartnerNotFoundError } from '../errors/tenant-partner-not-found.error';

@Injectable()
export class RemoveTenantPartnerUseCase {
    constructor(
        @Inject(TENANT_PARTNER_REPOSITORY)
        private readonly partnerRepo: TenantPartnerRepository,
        @Inject(TENANT_PARTNER_USER_REPOSITORY)
        private readonly partnerUserRepo: TenantPartnerUserRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        const partner = await this.partnerRepo.findById(tenantId, id);
        if (!partner) {
            throw new TenantPartnerNotFoundError(id);
        }

        await this.partnerUserRepo.removeByPartnerId(id);
        await this.partnerRepo.remove(tenantId, id);

        return { success: true };
    }
}
