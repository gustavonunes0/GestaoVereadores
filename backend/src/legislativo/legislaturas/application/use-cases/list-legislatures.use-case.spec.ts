import { ListLegislaturesUseCase } from './list-legislatures.use-case';
import {
    buildLegislatureEntity,
    buildLegislatureRepositoryMock,
} from './__tests__/legislature-test.helpers';

describe('ListLegislaturesUseCase', () => {
    it('lista legislaturas do tenant excluindo removidas', async () => {
        const repository = buildLegislatureRepositoryMock();
        repository.findMany.mockResolvedValue({
            data: [buildLegislatureEntity()],
            meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
        });

        const useCase = new ListLegislaturesUseCase(repository as never);
        const result = await useCase.execute('tenant-1', {});

        expect(result.data).toHaveLength(1);
        expect(repository.findMany).toHaveBeenCalledWith(
            'tenant-1',
            expect.objectContaining({ page: undefined, limit: undefined }),
        );
    });

    it('filtra legislatura atual', async () => {
        const repository = buildLegislatureRepositoryMock();
        repository.findMany.mockResolvedValue({
            data: [buildLegislatureEntity({ isCurrent: true })],
            meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
        });

        const useCase = new ListLegislaturesUseCase(repository as never);
        const result = await useCase.execute('tenant-1', { isCurrent: true });

        expect(result.data[0]?.isCurrent).toBe(true);
        expect(repository.findMany).toHaveBeenCalledWith(
            'tenant-1',
            expect.objectContaining({ isCurrent: true }),
        );
    });
});
