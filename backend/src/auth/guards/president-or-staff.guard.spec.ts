import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PresidentOrStaffGuard } from './president-or-staff.guard';
import { PresidenciaService } from '../../legislativo/sessoes-plenarias/domain/services/presidencia.service';
import { StaffAuthenticatedUser, ParlamentarianAuthenticatedUser } from '../../common/types/authenticated-request';

function makeContext(user: unknown): ExecutionContext {
    return {
        switchToHttp: () => ({
            getRequest: () => ({ user }),
        }),
    } as unknown as ExecutionContext;
}

function makeStaffUser(): StaffAuthenticatedUser {
    return {
        id: 'staff-1',
        authType: 'camara',
        sessionType: 'staff',
        tenantId: 'tenant-1',
        tenantUserId: 'tu-1',
        role: 'ADMIN_STAFF' as any,
    };
}

function makeParlamentarianUser(parliamentarianId: string): ParlamentarianAuthenticatedUser {
    return {
        id: 'parl-user-1',
        authType: 'camara',
        sessionType: 'parliamentarian',
        tenantId: 'tenant-1',
        parliamentarianUserId: 'pu-1',
        parliamentarianId,
        parliamentaryName: 'Vereador Teste',
    };
}

describe('PresidentOrStaffGuard', () => {
    let guard: PresidentOrStaffGuard;
    let presidenciaService: jest.Mocked<PresidenciaService>;

    beforeEach(() => {
        presidenciaService = {
            isPresidente: jest.fn(),
        } as unknown as jest.Mocked<PresidenciaService>;

        guard = new PresidentOrStaffGuard(presidenciaService);
    });

    it('Staff ADMIN_STAFF → canActivate = true', async () => {
        const ctx = makeContext(makeStaffUser());
        const result = await guard.canActivate(ctx);
        expect(result).toBe(true);
        expect(presidenciaService.isPresidente).not.toHaveBeenCalled();
    });

    it('Staff STAFF → canActivate = true', async () => {
        const user = makeStaffUser();
        user.role = 'STAFF' as any;
        const ctx = makeContext(user);
        const result = await guard.canActivate(ctx);
        expect(result).toBe(true);
    });

    it('Parlamentar que É Presidente → canActivate = true', async () => {
        presidenciaService.isPresidente.mockResolvedValue(true);
        const ctx = makeContext(makeParlamentarianUser('parl-presidente'));
        const result = await guard.canActivate(ctx);
        expect(result).toBe(true);
        expect(presidenciaService.isPresidente).toHaveBeenCalledWith('parl-presidente', 'tenant-1');
    });

    it('Parlamentar que NÃO é Presidente → ForbiddenException em PT-BR', async () => {
        presidenciaService.isPresidente.mockResolvedValue(false);
        const ctx = makeContext(makeParlamentarianUser('parl-comum'));
        await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
        await expect(guard.canActivate(ctx)).rejects.toThrow('Ação restrita ao Presidente da Câmara');
    });

    it('Sem Board ativo → ForbiddenException (isPresidente retorna false)', async () => {
        presidenciaService.isPresidente.mockResolvedValue(false);
        const ctx = makeContext(makeParlamentarianUser('parl-qualquer'));
        await expect(guard.canActivate(ctx)).rejects.toThrow('Ação restrita ao Presidente da Câmara');
    });

    it('Usuário sem authType camara → ForbiddenException', async () => {
        const siglUser = { id: 'sigl-1', authType: 'sigl', role: 'MASTER' };
        const ctx = makeContext(siglUser);
        await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
        await expect(guard.canActivate(ctx)).rejects.toThrow('Acesso não autorizado');
    });
});
