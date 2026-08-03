import { Injectable } from '@nestjs/common';
import { PushSubscriptionRepository } from '../../domain/repositories/push-subscription.repository';

@Injectable()
export class UnsubscribePushUseCase {
    constructor(private readonly repository: PushSubscriptionRepository) {}

    async execute(tenantId: string, userId: string, endpoint: string) {
        await this.repository.softDeleteByEndpoint(tenantId, userId, endpoint);
        return { enabled: false };
    }
}
