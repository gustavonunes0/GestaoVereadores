import { RemoveLegislatureUseCase } from './remove-legislature.use-case';
import {
    LegislatureHasActiveMandatesError,
    LegislatureNotFoundError,
} from '../errors/legislature.errors';
import {
    buildLegislatureEntity,
    buildLegislatureRepositoryMock,
} from './__tests__/legislature-test.helpers';

describe('RemoveLegislatureUseCase', () => {
    it('remove legislatura via soft delete', async () => {
        const repository = buildLegislatureRepositoryMock();
        repository.findById.mockResolvedValue(buildLegislatureEntity());
        repository.countActiveMandates.mockResolvedValue(0);

        const useCase = new RemoveLegislatureUseCase(repository as never);
        await useCase.execute('tenant-1', 'leg-1');

        expect(repository.softDelete).toHaveBeenCalledWith('tenant-1', 'leg-1');
    });

    it('bloqueia remoção com mandatos ativos', async () => {
        const repository = buildLegislatureRepositoryMock();
        repository.findById.mockResolvedValue(buildLegislatureEntity());
        repository.countActiveMandates.mockResolvedValue(2);

        const useCase = new RemoveLegislatureUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'leg-1'),
        ).rejects.toBeInstanceOf(LegislatureHasActiveMandatesError);
    });

    it('falha quando legislatura não existe', async () => {
        const repository = buildLegislatureRepositoryMock();
        repository.findById.mockResolvedValue(null);

        const useCase = new RemoveLegislatureUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'missing'),
        ).rejects.toBeInstanceOf(LegislatureNotFoundError);
    });
});
