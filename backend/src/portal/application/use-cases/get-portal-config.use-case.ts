import { Inject, Injectable } from '@nestjs/common';
import { PortalConfigRepository } from '../../domain/repositories/portal-config.repository';
import { PORTAL_CONFIG_REPOSITORY } from '../../portal.tokens';
import { PortalConfigViewModel } from '../view-models/portal-config.view-model';
import { GetPortalPreviewUrlUseCase } from './get-portal-preview-url.use-case';

@Injectable()
export class GetPortalConfigUseCase {
    constructor(
        @Inject(PORTAL_CONFIG_REPOSITORY)
        private readonly repository: PortalConfigRepository,
        private readonly getPreviewUrl: GetPortalPreviewUrlUseCase,
    ) {}

    async execute(tenantId: string) {
        const record = await this.repository.findByTenantId(tenantId);
        if (!record) {
            throw new Error('Câmara não encontrada');
        }
        const previewUrl = record.portalSlug
            ? this.getPreviewUrl.build(record.portalSlug)
            : null;
        return PortalConfigViewModel.toHttp(record, previewUrl);
    }
}
