import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
    PushSubscriptionRecord,
    PushSubscriptionRepository,
    UpsertPushSubscriptionInput,
} from '../../domain/repositories/push-subscription.repository';

@Injectable()
export class PrismaPushSubscriptionRepository extends PushSubscriptionRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async upsert(input: UpsertPushSubscriptionInput): Promise<PushSubscriptionRecord> {
        const row = await this.prisma.pushSubscription.upsert({
            where: { endpoint: input.endpoint },
            create: {
                tenantId: input.tenantId,
                userId: input.userId,
                parliamentarianId: input.parliamentarianId,
                endpoint: input.endpoint,
                p256dh: input.p256dh,
                auth: input.auth,
                userAgent: input.userAgent ?? null,
            },
            update: {
                tenantId: input.tenantId,
                userId: input.userId,
                parliamentarianId: input.parliamentarianId,
                p256dh: input.p256dh,
                auth: input.auth,
                userAgent: input.userAgent ?? null,
                isRemoved: false,
                removedAt: null,
            },
        });
        return this.map(row);
    }

    async softDeleteByEndpoint(
        tenantId: string,
        userId: string,
        endpoint: string,
    ): Promise<void> {
        await this.prisma.pushSubscription.updateMany({
            where: { tenantId, userId, endpoint, isRemoved: false },
            data: { isRemoved: true, removedAt: new Date() },
        });
    }

    async softDeleteById(id: string): Promise<void> {
        await this.prisma.pushSubscription.updateMany({
            where: { id, isRemoved: false },
            data: { isRemoved: true, removedAt: new Date() },
        });
    }

    async findActiveByTenantForParliamentarians(
        tenantId: string,
    ): Promise<PushSubscriptionRecord[]> {
        const rows = await this.prisma.pushSubscription.findMany({
            where: {
                tenantId,
                isRemoved: false,
                parliamentarianId: { not: null },
                parliamentarian: {
                    status: 'ACTIVE',
                    isRemoved: false,
                },
            },
        });
        return rows.map((row) => this.map(row));
    }

    private map(row: {
        id: string;
        tenantId: string;
        userId: string;
        parliamentarianId: string | null;
        endpoint: string;
        p256dh: string;
        auth: string;
        userAgent: string | null;
    }): PushSubscriptionRecord {
        return {
            id: row.id,
            tenantId: row.tenantId,
            userId: row.userId,
            parliamentarianId: row.parliamentarianId,
            endpoint: row.endpoint,
            p256dh: row.p256dh,
            auth: row.auth,
            userAgent: row.userAgent,
        };
    }
}
