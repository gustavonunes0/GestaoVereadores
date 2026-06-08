import { GetNormaByIdUseCase } from './get-norma-by-id.use-case';
import { NormaNotFoundError } from '../errors/norma.errors';
import {
    buildNormaEntity,
    buildNormaRepositoryMock,
} from './__tests__/norma-test.helpers';

describe('GetNormaByIdUseCase', () => {
    it('busca norma por id e tenantId', async () => {
        const repository = buildNormaRepositoryMock();
        repository.findById.mockResolvedValue(buildNormaEntity());

        const useCase = new GetNormaByIdUseCase(repository as never);
        const result = await useCase.execute('tenant-1', 'norma-1');

        expect(repository.findById).toHaveBeenCalledWith('tenant-1', 'norma-1');
        expect(result.id).toBe('norma-1');
        expect(result.tipo).toBeDefined();
    });

    it('retorna erro quando norma não existe', async () => {
        const repository = buildNormaRepositoryMock();
        repository.findById.mockResolvedValue(null);

        const useCase = new GetNormaByIdUseCase(repository as never);
        await expect(
            useCase.execute('tenant-1', 'missing'),
        ).rejects.toBeInstanceOf(NormaNotFoundError);
    });
});
