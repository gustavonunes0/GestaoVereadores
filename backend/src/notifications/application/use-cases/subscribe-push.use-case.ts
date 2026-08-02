import { BadRequestException, Injectable } from '@nestjs/common';
import { PushSubscriptionRepository } from '../../domain/repositories/push-subscription.repository';
import { SubscribePushDto } from '../dto/subscribe-push.dto';
import { WebPushSender } from '../../infra/web-push.sender';

@Injectable()
export class SubscribePushUseCase {
    constructor(
        private readonly repository: PushSubscriptionRepository,
        private readonly webPush: WebPushSender,
    ) {}

    async execute(input: {
        tenantId: string;
        userId: string;
        parliamentarianId: string | null;
        dto: SubscribePushDto;
    }) {
        if (!this.webPush.isConfigured()) {
            throw new BadRequestException(
                'Notificações push não estão configuradas neste ambiente',
            );
        }

        const record = await this.repository.upsert({
            tenantId: input.tenantId,
            userId: input.userId,
            parliamentarianId: input.parliamentarianId,
            endpoint: input.dto.endpoint,
            p256dh: input.dto.keys.p256dh,
            auth: input.dto.keys.auth,
            userAgent: input.dto.userAgent,
        });

        return {
            id: record.id,
            endpoint: record.endpoint,
            enabled: true,
        };
    }
}
