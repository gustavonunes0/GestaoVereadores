import { ListPoliticalPartiesUseCase } from './list-political-parties.use-case';
import {
    buildPoliticalPartyEntity,
    buildPoliticalPartyRepositoryMock,
} from './__tests__/political-party-test.helpers';

describe('ListPoliticalPartiesUseCase', () => {
    it('lista partidos ativos do tenant', async () => {
        const repository = buildPoliticalPartyRepositoryMock();
        repository.findMany.mockResolvedValue({
            data: [buildPoliticalPartyEntity()],
            meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
        });

        const useCase = new ListPoliticalPartiesUseCase(repository as never);
        const result = await useCase.execute('tenant-1', {});

        expect(result.data).toHaveLength(1);
        expect(repository.findMany).toHaveBeenCalledWith(
            'tenant-1',
            expect.any(Object),
        );
    });
});
