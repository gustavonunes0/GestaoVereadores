export type PushSubscriptionRecord = {
    id: string;
    tenantId: string;
    userId: string;
    parliamentarianId: string | null;
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent: string | null;
};

export type UpsertPushSubscriptionInput = {
    tenantId: string;
    userId: string;
    parliamentarianId: string | null;
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent?: string | null;
};

export abstract class PushSubscriptionRepository {
    abstract upsert(input: UpsertPushSubscriptionInput): Promise<PushSubscriptionRecord>;

    abstract softDeleteByEndpoint(
        tenantId: string,
        userId: string,
        endpoint: string,
    ): Promise<void>;

    abstract softDeleteById(id: string): Promise<void>;

    abstract findActiveByTenantForParliamentarians(
        tenantId: string,
    ): Promise<PushSubscriptionRecord[]>;
}
