import { applyDecorators, UseGuards } from '@nestjs/common';
import { TenantMaintainerGuard } from '../guards/tenant-maintainer.guard';

/** Exige TenantUser com isTenantAdmin ou isTenantStaff (responsável da Câmara). */
export const TenantMaintainer = () =>
    applyDecorators(UseGuards(TenantMaintainerGuard));
