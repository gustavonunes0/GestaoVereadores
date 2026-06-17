import { Inject, Injectable } from '@nestjs/common';
import {
    PortalSlugAlreadyInUseError,
    PortalSlugInvalidError,
} from '../../domain/errors/portal.errors';
import { PortalConfigRepository } from '../../domain/repositories/portal-config.repository';
import {
    assertValidPortalSlug,
    normalizePortalSlug,
    type PortalSettings,
} from '../../domain/types/portal-settings.types';
import { PORTAL_CONFIG_REPOSITORY } from '../../portal.tokens';
import { UpdatePortalConfigDto } from '../dto/update-portal-config.dto';
import { PortalConfigViewModel } from '../view-models/portal-config.view-model';
import { GetPortalPreviewUrlUseCase } from './get-portal-preview-url.use-case';

@Injectable()
export class UpdatePortalConfigUseCase {
    constructor(
        @Inject(PORTAL_CONFIG_REPOSITORY)
        private readonly repository: PortalConfigRepository,
        private readonly getPreviewUrl: GetPortalPreviewUrlUseCase,
    ) {}

    async execute(tenantId: string, dto: UpdatePortalConfigDto) {
        let portalSlug: string | null | undefined = dto.portalSlug;

        if (portalSlug !== undefined && portalSlug !== null) {
            const normalized = normalizePortalSlug(portalSlug);
            try {
                assertValidPortalSlug(normalized);
            } catch (error) {
                throw new PortalSlugInvalidError(
                    error instanceof Error
                        ? error.message
                        : 'Slug inválido',
                );
            }
            const taken = await this.repository.isPortalSlugTaken(
                normalized,
                tenantId,
            );
            if (taken) {
                throw new PortalSlugAlreadyInUseError();
            }
            portalSlug = normalized;
        }

        const updated = await this.repository.updateByTenantId(tenantId, {
            portalSlug,
            portal: dto.portal as Partial<PortalSettings> | undefined,
        });

        const previewUrl = updated.portalSlug
            ? this.getPreviewUrl.build(updated.portalSlug)
            : null;

        return PortalConfigViewModel.toHttp(updated, previewUrl);
    }
}
