import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../../users/domain/user.repository';
import { USER_REPOSITORY } from '../../../users/users.tokens';
import { TenantPartnerRepository } from '../../domain/repositories/tenant-partner.repository';
import { TenantPartnerUserRepository } from '../../domain/repositories/tenant-partner-user.repository';
import {
    TENANT_PARTNER_REPOSITORY,
    TENANT_PARTNER_USER_REPOSITORY,
} from '../../tenant-partners.tokens';
import { TenantPartnerNotFoundError } from '../errors/tenant-partner-not-found.error';
import { TenantPartnerUserNotFoundError } from '../errors/tenant-partner-user-not-found.error';
import { TenantPartnerViewModel } from '../view-models/tenant-partner.view-model';

@Injectable()
export class RemoveTenantPartnerUserUseCase {
    constructor(
        @Inject(TENANT_PARTNER_REPOSITORY)
        private readonly partnerRepo: TenantPartnerRepository,
        @Inject(TENANT_PARTNER_USER_REPOSITORY)
        private readonly partnerUserRepo: TenantPartnerUserRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepo: UserRepository,
    ) {}

    async execute(tenantId: string, partnerId: string) {
        const partner = await this.partnerRepo.findById(tenantId, partnerId);
        if (!partner) {
            throw new TenantPartnerNotFoundError(partnerId);
        }

        const link = await this.partnerUserRepo.findByPartnerId(partnerId);
        if (!link || link.tenantId !== tenantId) {
            throw new TenantPartnerUserNotFoundError();
        }

        await this.partnerUserRepo.removeByPartnerId(partnerId);
        await this.userRepo.remove(link.userId);

        return TenantPartnerViewModel.toHttp(partner, {
            usuarioVinculado: false,
            usuario: null,
        });
    }
}
