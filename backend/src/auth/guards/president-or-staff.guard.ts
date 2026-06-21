import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PresidenciaService } from '../../legislativo/sessoes-plenarias/domain/services/presidencia.service';
import { AuthenticatedUser, isParlamentarianUser, isStaffUser } from '../../common/types/authenticated-request';

@Injectable()
export class PresidentOrStaffGuard implements CanActivate {
    constructor(private readonly presidenciaService: PresidenciaService) {}

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const user: AuthenticatedUser = ctx.switchToHttp().getRequest<{ user: AuthenticatedUser }>().user;

        if (isStaffUser(user)) return true;

        if (isParlamentarianUser(user)) {
            const isP = await this.presidenciaService.isPresidente(user.parliamentarianId, user.tenantId);
            if (!isP) throw new ForbiddenException('Ação restrita ao Presidente da Câmara');
            return true;
        }

        throw new ForbiddenException('Acesso não autorizado');
    }
}
