import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    Get,
    NotFoundException,
    Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantRoles } from '../../../common/decorators/tenant-roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { ADMIN_ONLY } from '../../../auth/guards/guard-combos';
import {
    PortalSlugAlreadyInUseError,
    PortalSlugInvalidError,
} from '../../domain/errors/portal.errors';
import { UpdatePortalConfigDto } from '../dto/update-portal-config.dto';
import { GetPortalConfigUseCase } from '../use-cases/get-portal-config.use-case';
import { GetPortalPreviewUrlUseCase } from '../use-cases/get-portal-preview-url.use-case';
import { UpdatePortalConfigUseCase } from '../use-cases/update-portal-config.use-case';

@ApiTags('portal-config')
@ApiBearerAuth()
@Controller('portal/config')
export class PortalConfigController {
    constructor(
        private readonly getPortalConfig: GetPortalConfigUseCase,
        private readonly updatePortalConfig: UpdatePortalConfigUseCase,
        private readonly getPortalPreviewUrl: GetPortalPreviewUrlUseCase,
    ) {}

    @TenantRoles(...ADMIN_ONLY)
    @Get()
    getConfig(@TenantId() tenantId: string) {
        return this.getPortalConfig.execute(tenantId);
    }

    @TenantRoles(...ADMIN_ONLY)
    @Patch()
    async patchConfig(
        @TenantId() tenantId: string,
        @Body() dto: UpdatePortalConfigDto,
    ) {
        try {
            return await this.updatePortalConfig.execute(tenantId, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...ADMIN_ONLY)
    @Get('preview-url')
    previewUrl(@TenantId() tenantId: string) {
        return this.getPortalConfig.execute(tenantId).then((config) => {
            if (!config.portalSlug) {
                return { url: null };
            }
            return this.getPortalPreviewUrl.execute(config.portalSlug);
        });
    }

    private handleError(error: unknown): never {
        if (error instanceof PortalSlugAlreadyInUseError) {
            throw new ConflictException(error.message);
        }
        if (error instanceof PortalSlugInvalidError) {
            throw new BadRequestException(error.message);
        }
        throw error;
    }
}
