import { RemoveParliamentarianUseCase } from './remove-parliamentarian.use-case';
import { ParliamentarianNotFoundError } from '../errors/parliamentarian.errors';
import {
    buildParliamentarianRepositoryMock,
    buildParliamentarianWithRelations,
} from './__tests__/parliamentarian-test.helpers';

describe('RemoveParliamentarianUseCase', () => {
    it('remove parlamentar com soft delete', async () => {
        const repository = buildParliamentarianRepositoryMock();
        repository.findById.mockResolvedValue(buildParliamentarianWithRelations());
        repository.softDelete.mockResolvedValue(undefined);

        const useCase = new RemoveParliamentarianUseCase(repository as never);
        const result = await useCase.execute('tenant-1', 'parl-1');

        expect(repository.softDelete).toHaveBeenCalledWith('tenant-1', 'parl-1');
        expect(result.tenantUserId).toBe('tu-1');
    });

    it('falha quando parlamentar não existe', async () => {
        const repository = buildParliamentarianRepositoryMock();
        repository.findById.mockResolvedValue(null);

        const useCase = new RemoveParliamentarianUseCase(repository as never);
        await expect(
            useCase.execute('tenant-1', 'missing'),
        ).rejects.toBeInstanceOf(ParliamentarianNotFoundError);
    });
});
