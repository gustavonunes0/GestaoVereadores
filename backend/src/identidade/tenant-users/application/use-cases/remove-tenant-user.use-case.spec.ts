import { RemoveTenantUserUseCase } from './remove-tenant-user.use-case';
import { TenantUserHasActiveParliamentarianError } from '../errors/tenant-user-has-active-parliamentarian.error';
import { TenantUserNotFoundError } from '../errors/tenant-user-not-found.error';
import { TenantUserEntity, TenantUserStatus } from '../../domain/entities/tenant-user.entity';

describe('RemoveTenantUserUseCase', () => {
    const tenantUser = TenantUserEntity.restore({
        id: 'tu-1',
        tenantId: 'tenant-1',
        userId: 'user-1',
        isTenantAdmin: false,
        isTenantStaff: false,
        isParliamentarian: true,
        status: TenantUserStatus.ACTIVE,
        permissions: [],
        lastAccessAt: null,
        removedAt: null,
        createdAt: new Date(),
        createdBy: null,
        modifiedAt: new Date(),
        modifiedBy: null,
        isRemoved: false,
    });

    it('bloqueia remoção quando há parlamentar ativo', async () => {
        const useCase = new RemoveTenantUserUseCase(
            {
                findById: jest.fn().mockResolvedValue(tenantUser),
                remove: jest.fn(),
            } as never,
            {
                hasActiveParliamentarian: jest.fn().mockResolvedValue(true),
            } as never,
        );

        await expect(useCase.execute('tu-1')).rejects.toBeInstanceOf(
            TenantUserHasActiveParliamentarianError,
        );
    });

    it('remove quando não há parlamentar ativo', async () => {
        const remove = jest.fn().mockResolvedValue(undefined);
        const useCase = new RemoveTenantUserUseCase(
            {
                findById: jest.fn().mockResolvedValue(tenantUser),
                remove,
            } as never,
            {
                hasActiveParliamentarian: jest.fn().mockResolvedValue(false),
            } as never,
        );

        await useCase.execute('tu-1');
        expect(remove).toHaveBeenCalledWith('tu-1');
    });

    it('lança not found quando tenant user não existe', async () => {
        const useCase = new RemoveTenantUserUseCase(
            {
                findById: jest.fn().mockResolvedValue(null),
                remove: jest.fn(),
            } as never,
            {
                hasActiveParliamentarian: jest.fn(),
            } as never,
        );

        await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
            TenantUserNotFoundError,
        );
    });
});
