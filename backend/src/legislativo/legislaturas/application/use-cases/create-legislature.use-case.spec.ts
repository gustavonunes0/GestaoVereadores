import { CreateLegislatureUseCase } from './create-legislature.use-case';
import {
    LegislatureInvalidDateRangeError,
    LegislatureNumberAlreadyInUseError,
} from '../errors/legislature.errors';
import {
    buildLegislatureEntity,
    buildLegislatureRepositoryMock,
} from './__tests__/legislature-test.helpers';

describe('CreateLegislatureUseCase', () => {
    const dto = {
        number: 21,
        startDate: '2025-01-01',
        endDate: '2028-12-31',
    };

    it('cria legislatura vinculada ao tenant', async () => {
        const repository = buildLegislatureRepositoryMock();
        repository.existsByNumber.mockResolvedValue(false);
        repository.create.mockResolvedValue(
            buildLegislatureEntity({ number: 21, isCurrent: false }),
        );

        const useCase = new CreateLegislatureUseCase(repository as never);
        const result = await useCase.execute('tenant-1', dto);

        expect(result.number).toBe(21);
        expect(repository.create).toHaveBeenCalledWith(
            expect.objectContaining({ tenantId: 'tenant-1', number: 21 }),
        );
    });

    it('bloqueia número duplicado no tenant', async () => {
        const repository = buildLegislatureRepositoryMock();
        repository.existsByNumber.mockResolvedValue(true);

        const useCase = new CreateLegislatureUseCase(repository as never);

        await expect(useCase.execute('tenant-1', dto)).rejects.toBeInstanceOf(
            LegislatureNumberAlreadyInUseError,
        );
    });

    it('bloqueia data fim anterior à data início', async () => {
        const repository = buildLegislatureRepositoryMock();
        repository.existsByNumber.mockResolvedValue(false);

        const useCase = new CreateLegislatureUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', {
                ...dto,
                startDate: '2028-01-01',
                endDate: '2025-01-01',
            }),
        ).rejects.toBeInstanceOf(LegislatureInvalidDateRangeError);
    });

    it('marca como atual e garante unicidade via repositório transacional', async () => {
        const repository = buildLegislatureRepositoryMock();
        repository.existsByNumber.mockResolvedValue(false);
        repository.create.mockResolvedValue(
            buildLegislatureEntity({ isCurrent: true }),
        );
        repository.countCurrentLegislatures.mockResolvedValue(1);

        const useCase = new CreateLegislatureUseCase(repository as never);
        const result = await useCase.execute('tenant-1', {
            ...dto,
            isCurrent: true,
        });

        expect(result.isCurrent).toBe(true);
        expect(repository.create).toHaveBeenCalledWith(
            expect.objectContaining({ isCurrent: true }),
        );
    });
});
