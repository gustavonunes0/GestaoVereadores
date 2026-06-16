import { RemoveAtoUseCase } from './remove-ato.use-case';
import { AtoNotFoundError } from '../errors/ato.errors';
import { buildAtoEntity, buildAtoRepositoryMock } from './__tests__/ato-test.helpers';

const TENANT_ID = 'tenant-1';

describe('RemoveAtoUseCase', () => {
    it('remove ato com soft delete', async () => {
        const repository = buildAtoRepositoryMock();
        repository.findById.mockResolvedValue(buildAtoEntity());
        repository.remove.mockResolvedValue(undefined);

        const useCase = new RemoveAtoUseCase(repository as never);
        const result = await useCase.execute(TENANT_ID, 'ato-1');

        expect(repository.remove).toHaveBeenCalledWith(TENANT_ID, 'ato-1');
        expect(result.id).toBe('ato-1');
        expect(result.tipo).toBeDefined();
        expect(result.classificacao).toBeDefined();
    });

    it('falha quando ato não existe', async () => {
        const repository = buildAtoRepositoryMock();
        repository.findById.mockResolvedValue(null);

        const useCase = new RemoveAtoUseCase(repository as never);
        await expect(useCase.execute(TENANT_ID, 'missing')).rejects.toBeInstanceOf(
            AtoNotFoundError,
        );
    });
});
