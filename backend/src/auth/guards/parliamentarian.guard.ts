import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import {
    AuthenticatedUser,
    isParlamentarianUser,
} from '../../common/types/authenticated-request';

@Injectable()
export class ParlamentarianGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const user: AuthenticatedUser = context
            .switchToHttp()
            .getRequest<{ user: AuthenticatedUser }>().user;

        if (!isParlamentarianUser(user)) {
            throw new ForbiddenException('Acesso restrito a parlamentares');
        }
        return true;
    }
}
