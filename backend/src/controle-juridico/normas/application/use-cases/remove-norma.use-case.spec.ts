import { RemoveNormaUseCase } from './remove-norma.use-case';
import { NormaNotFoundError } from '../errors/norma.errors';
import {
    buildNormaEntity,
    buildNormaRepositoryMock,
} from './__tests__/norma-test.helpers';

describe('RemoveNormaUseCase', () => {
    it('remove norma com soft delete', async () => {
        const repository = buildNormaRepositoryMock();
        repository.findById.mockResolvedValue(buildNormaEntity());
        repository.softDelete.mockResolvedValue(undefined);

        const useCase = new RemoveNormaUseCase(repository as never);
        const result = await useCase.execute('tenant-1', 'norma-1');

        expect(repository.softDelete).toHaveBeenCalledWith('tenant-1', 'norma-1');
        expect(result.id).toBe('norma-1');
    });

    it('falha quando norma não existe', async () => {
        const repository = buildNormaRepositoryMock();
        repository.findById.mockResolvedValue(null);

        const useCase = new RemoveNormaUseCase(repository as never);
        await expect(
            useCase.execute('tenant-1', 'missing'),
        ).rejects.toBeInstanceOf(NormaNotFoundError);
    });
});
