import { Inject, Injectable } from '@nestjs/common';
import { ActiveParliamentarianChecker } from '../../domain/contracts/active-parliamentarian-checker';
import { TenantUserRepository } from '../../domain/repositories/tenant-user.repository';
import {
    ACTIVE_PARLIAMENTARIAN_CHECKER,
    TENANT_USER_REPOSITORY,
} from '../../tenant-users.tokens';
import { TenantUserHasActiveParliamentarianError } from '../errors/tenant-user-has-active-parliamentarian.error';
import { TenantUserNotFoundError } from '../errors/tenant-user-not-found.error';

@Injectable()
export class RemoveTenantUserUseCase {
    constructor(
        @Inject(TENANT_USER_REPOSITORY)
        private readonly tenantUserRepository: TenantUserRepository,
        @Inject(ACTIVE_PARLIAMENTARIAN_CHECKER)
        private readonly activeParliamentarianChecker: ActiveParliamentarianChecker,
    ) {}

    async execute(id: string): Promise<void> {
        const tenantUser = await this.tenantUserRepository.findById(id);
        if (!tenantUser) {
            throw new TenantUserNotFoundError(id);
        }

        const hasActiveParliamentarian =
            await this.activeParliamentarianChecker.hasActiveParliamentarian(
                tenantUser.tenantId,
                tenantUser.id,
            );
        if (hasActiveParliamentarian) {
            throw new TenantUserHasActiveParliamentarianError();
        }

        await this.tenantUserRepository.remove(id);
    }
}
