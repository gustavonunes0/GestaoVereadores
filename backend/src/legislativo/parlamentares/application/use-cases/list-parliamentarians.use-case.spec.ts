import { ListParliamentariansUseCase } from './list-parliamentarians.use-case';
import {
    buildParliamentarianRepositoryMock,
    buildParliamentarianWithRelations,
} from './__tests__/parliamentarian-test.helpers';

describe('ListParliamentariansUseCase', () => {
    it('lista parlamentares com dados do User', async () => {
        const repository = buildParliamentarianRepositoryMock();
        repository.findMany.mockResolvedValue({
            data: [buildParliamentarianWithRelations()],
            meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
        });

        const useCase = new ListParliamentariansUseCase(repository as never);
        const result = await useCase.execute('tenant-1', { page: 1, limit: 20 });

        expect(result.data[0].user.firstName).toBe('João');
        expect(result.data[0].tenantUserId).toBe('tu-1');
    });
});
