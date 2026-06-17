import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { AuthenticatedUser, isStaffUser } from '../../common/types/authenticated-request';

@Injectable()
export class StaffGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const user: AuthenticatedUser = context
            .switchToHttp()
            .getRequest<{ user: AuthenticatedUser }>().user;

        if (!isStaffUser(user)) {
            throw new ForbiddenException('Acesso restrito a servidores da câmara');
        }
        return true;
    }
}
