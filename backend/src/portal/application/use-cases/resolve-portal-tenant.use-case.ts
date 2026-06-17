import { Inject, Injectable } from '@nestjs/common';
import {
    PortalInactiveError,
    PortalNotFoundError,
} from '../../domain/errors/portal.errors';
import { PortalConfigRepository } from '../../domain/repositories/portal-config.repository';
import { PORTAL_CONFIG_REPOSITORY } from '../../portal.tokens';

@Injectable()
export class ResolvePortalTenantUseCase {
    constructor(
        @Inject(PORTAL_CONFIG_REPOSITORY)
        private readonly repository: PortalConfigRepository,
    ) {}

    async execute(slug: string) {
        const record = await this.repository.findByPortalSlug(slug);
        if (!record) {
            throw new PortalNotFoundError();
        }
        if (!record.portal.ativo) {
            throw new PortalInactiveError();
        }
        return record;
    }
}
