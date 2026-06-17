import { Injectable } from '@nestjs/common';
import { Prisma, TenantStatus } from '@prisma/client';
import { assertTenantScopedUpdate } from '../../../common/prisma/tenant-scoped-update';
import { PrismaService } from '../../../prisma/prisma.service';
import {
    PortalConfigRepository,
    PortalTenantRecord,
    UpdatePortalConfigInput,
} from '../../domain/repositories/portal-config.repository';
import {
    mergePortalSettings,
    parsePortalSettings,
    serializePortalSettings,
} from '../../domain/types/portal-settings.types';

@Injectable()
export class PrismaPortalConfigRepository extends PortalConfigRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async findByTenantId(
        tenantId: string,
    ): Promise<PortalTenantRecord | null> {
        const row = await this.prisma.tenant.findFirst({
            where: { id: tenantId, isRemoved: false },
            select: {
                id: true,
                name: true,
                logo: true,
                portalSlug: true,
                settings: true,
            },
        });
        return row ? this.toRecord(row) : null;
    }

    async findByPortalSlug(slug: string): Promise<PortalTenantRecord | null> {
        const row = await this.prisma.tenant.findFirst({
            where: {
                portalSlug: slug,
                isRemoved: false,
                status: TenantStatus.ACTIVE,
            },
            select: {
                id: true,
                name: true,
                logo: true,
                portalSlug: true,
                settings: true,
            },
        });
        if (!row?.portalSlug) return null;
        return this.toRecord(row);
    }

    async updateByTenantId(
        tenantId: string,
        input: UpdatePortalConfigInput,
    ): Promise<PortalTenantRecord> {
        const existing = await this.findByTenantId(tenantId);
        if (!existing) {
            throw new Error('Câmara não encontrada');
        }

        const nextPortal = input.portal
            ? mergePortalSettings(existing.portal, input.portal)
            : existing.portal;

        const existingRow = await this.prisma.tenant.findFirst({
            where: { id: tenantId, isRemoved: false },
            select: { settings: true },
        });

        const mergedSettings = this.mergeTenantSettings(
            existingRow?.settings,
            nextPortal,
        );

        const result = await this.prisma.tenant.updateMany({
            where: { id: tenantId, isRemoved: false },
            data: {
                ...(input.portalSlug !== undefined
                    ? { portalSlug: input.portalSlug }
                    : {}),
                settings: mergedSettings as Prisma.InputJsonValue,
            },
        });
        assertTenantScopedUpdate(result.count, 'Câmara não encontrada');

        const updated = await this.findByTenantId(tenantId);
        if (!updated) {
            throw new Error('Câmara não encontrada');
        }
        return updated;
    }

    async isPortalSlugTaken(
        slug: string,
        ignoreTenantId?: string,
    ): Promise<boolean> {
        const row = await this.prisma.tenant.findFirst({
            where: {
                portalSlug: slug,
                isRemoved: false,
                ...(ignoreTenantId ? { NOT: { id: ignoreTenantId } } : {}),
            },
            select: { id: true },
        });
        return Boolean(row);
    }

    private mergeTenantSettings(
        current: unknown,
        portal: ReturnType<typeof parsePortalSettings>,
    ): Record<string, unknown> {
        const base =
            current && typeof current === 'object'
                ? { ...(current as Record<string, unknown>) }
                : {};
        return {
            ...base,
            ...serializePortalSettings(portal),
        };
    }

    private toRecord(row: {
        id: string;
        name: string;
        logo: string | null;
        portalSlug: string | null;
        settings: unknown;
    }): PortalTenantRecord {
        const portal = parsePortalSettings(row.settings, row.name);
        return {
            tenantId: row.id,
            name: row.name,
            logo: row.logo,
            portalSlug: row.portalSlug ?? '',
            portal,
        };
    }
}
