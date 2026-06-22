import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
    TenantPartnerUserEntity,
    TenantPartnerUserPrimitives,
} from '../../domain/entities/tenant-partner-user.entity';
import { TenantPartnerUserRepository } from '../../domain/repositories/tenant-partner-user.repository';

@Injectable()
export class PrismaTenantPartnerUserRepository extends TenantPartnerUserRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async create(partnerUser: TenantPartnerUserEntity): Promise<TenantPartnerUserEntity> {
        const data = partnerUser.toPrimitives();
        const row = await this.prisma.tenantPartnerUser.create({ data });
        return this.toEntity(row);
    }

    async findByPartnerId(tenantPartnerId: string): Promise<TenantPartnerUserEntity | null> {
        const row = await this.prisma.tenantPartnerUser.findFirst({
            where: { tenantPartnerId, isRemoved: false },
        });
        return row ? this.toEntity(row) : null;
    }

    async findLinkedPartnerIds(tenantPartnerIds: string[]): Promise<string[]> {
        const links = await this.findLinksByPartnerIds(tenantPartnerIds);
        return links.map((l) => l.tenantPartnerId);
    }

    async findLinksByPartnerIds(tenantPartnerIds: string[]): Promise<
        Array<{ tenantPartnerId: string; userId: string }>
    > {
        if (tenantPartnerIds.length === 0) return [];
        const rows = await this.prisma.tenantPartnerUser.findMany({
            where: {
                tenantPartnerId: { in: tenantPartnerIds },
                isRemoved: false,
            },
            select: { tenantPartnerId: true, userId: true },
        });
        return rows.map((r) => ({
            tenantPartnerId: r.tenantPartnerId,
            userId: r.userId,
        }));
    }

    async removeByPartnerId(tenantPartnerId: string): Promise<void> {
        const now = new Date();
        await this.prisma.tenantPartnerUser.updateMany({
            where: { tenantPartnerId, isRemoved: false },
            data: { isRemoved: true, removedAt: now, updatedAt: now },
        });
    }

    private toEntity(row: TenantPartnerUserPrimitives): TenantPartnerUserEntity {
        return TenantPartnerUserEntity.restore(row);
    }
}
