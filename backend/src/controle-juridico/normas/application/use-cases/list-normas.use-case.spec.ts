import { ListNormasUseCase } from './list-normas.use-case';
import {
    buildNormaEntity,
    buildNormaRepositoryMock,
} from './__tests__/norma-test.helpers';

describe('ListNormasUseCase', () => {
    it('lista normas com paginação por tenant', async () => {
        const repository = buildNormaRepositoryMock();
        repository.findMany.mockResolvedValue({
            data: [buildNormaEntity()],
            meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
        });

        const useCase = new ListNormasUseCase(repository as never);
        const result = await useCase.execute('tenant-1', {
            page: 1,
            limit: 20,
        });

        expect(repository.findMany).toHaveBeenCalledWith(
            'tenant-1',
            expect.objectContaining({ page: 1, limit: 20 }),
        );
        expect(result.data).toHaveLength(1);
    });

    it('repassa filtros de busca ao repository', async () => {
        const repository = buildNormaRepositoryMock();
        repository.findMany.mockResolvedValue({
            data: [],
            meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
        });

        const useCase = new ListNormasUseCase(repository as never);
        await useCase.execute('tenant-1', {
            search: 'lei',
            tipoId: 'tipo-1',
            page: 1,
            limit: 10,
        });

        expect(repository.findMany).toHaveBeenCalledWith(
            'tenant-1',
            expect.objectContaining({
                search: 'lei',
                tipoId: 'tipo-1',
            }),
        );
    });
});
