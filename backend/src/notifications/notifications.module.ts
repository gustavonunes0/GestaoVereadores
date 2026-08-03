import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PushController } from './application/controllers/push.controller';
import { SubscribePushUseCase } from './application/use-cases/subscribe-push.use-case';
import { UnsubscribePushUseCase } from './application/use-cases/unsubscribe-push.use-case';
import { NotifySessaoAbertaUseCase } from './application/use-cases/notify-sessao-aberta.use-case';
import { PrismaPushSubscriptionRepository } from './infra/prisma/prisma-push-subscription.repository';
import { PushSubscriptionRepository } from './domain/repositories/push-subscription.repository';
import { WebPushSender } from './infra/web-push.sender';
import { PUSH_SUBSCRIPTION_REPOSITORY } from './push.tokens';

@Module({
    imports: [PrismaModule],
    controllers: [PushController],
    providers: [
        PrismaPushSubscriptionRepository,
        {
            provide: PUSH_SUBSCRIPTION_REPOSITORY,
            useExisting: PrismaPushSubscriptionRepository,
        },
        {
            provide: PushSubscriptionRepository,
            useExisting: PrismaPushSubscriptionRepository,
        },
        WebPushSender,
        SubscribePushUseCase,
        UnsubscribePushUseCase,
        NotifySessaoAbertaUseCase,
    ],
    exports: [NotifySessaoAbertaUseCase, WebPushSender],
})
export class NotificationsModule {}
