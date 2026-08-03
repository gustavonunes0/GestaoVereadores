import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Post,
    Req,
    ServiceUnavailableException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators/public.decorator';
import { TenantRoles } from '../../../common/decorators/tenant-roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import {
    ALL_AUTHENTICATED,
    PARLIAMENTARIAN_ONLY,
} from '../../../auth/guards/guard-combos';
import {
    AuthenticatedUser,
    isParlamentarianUser,
} from '../../../common/types/authenticated-request';
import { SubscribePushDto, UnsubscribePushDto } from '../dto/subscribe-push.dto';
import { SubscribePushUseCase } from '../use-cases/subscribe-push.use-case';
import { UnsubscribePushUseCase } from '../use-cases/unsubscribe-push.use-case';
import { WebPushSender } from '../../infra/web-push.sender';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications/push')
export class PushController {
    constructor(
        private readonly subscribePush: SubscribePushUseCase,
        private readonly unsubscribePush: UnsubscribePushUseCase,
        private readonly webPush: WebPushSender,
    ) {}

    @Public()
    @Get('vapid-public-key')
    getVapidPublicKey() {
        const key = this.webPush.getPublicKey();
        if (!key) {
            throw new ServiceUnavailableException(
                'Notificações push não estão configuradas',
            );
        }
        return { publicKey: key };
    }

    @TenantRoles(...PARLIAMENTARIAN_ONLY)
    @Post('subscriptions')
    subscribe(
        @TenantId() tenantId: string,
        @Body() dto: SubscribePushDto,
        @Req() req: { user: AuthenticatedUser },
    ) {
        const user = req.user;
        if (!isParlamentarianUser(user)) {
            throw new ForbiddenException('Apenas parlamentares podem ativar push');
        }

        return this.subscribePush.execute({
            tenantId,
            userId: user.id,
            parliamentarianId: user.parliamentarianId,
            dto: {
                ...dto,
                userAgent: dto.userAgent ?? undefined,
            },
        });
    }

    @TenantRoles(...ALL_AUTHENTICATED)
    @Delete('subscriptions')
    unsubscribe(
        @TenantId() tenantId: string,
        @Body() dto: UnsubscribePushDto,
        @Req() req: { user: AuthenticatedUser },
    ) {
        return this.unsubscribePush.execute(tenantId, req.user.id, dto.endpoint);
    }
}
