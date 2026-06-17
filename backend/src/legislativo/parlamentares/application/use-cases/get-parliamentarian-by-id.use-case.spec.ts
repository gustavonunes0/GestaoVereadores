import { GetParliamentarianByIdUseCase } from './get-parliamentarian-by-id.use-case';
import { ParliamentarianNotFoundError } from '../errors/parliamentarian.errors';
import {
    buildParliamentarianRepositoryMock,
    buildParliamentarianWithRelations,
} from './__tests__/parliamentarian-test.helpers';

describe('GetParliamentarianByIdUseCase', () => {
    it('retorna parlamentar com dados do User via TenantUser', async () => {
        const repository = buildParliamentarianRepositoryMock();
        repository.findById.mockResolvedValue(buildParliamentarianWithRelations());

        const useCase = new GetParliamentarianByIdUseCase(repository as never);
        const result = await useCase.execute('tenant-1', 'parl-1');

        expect(result.user).toEqual({
            id: 'user-1',
            firstName: 'João',
            lastName: 'Silva',
            email: 'parlamentar.52998224725@interno.sigl.local',
        });
        expect(result.hasAccess).toBe(true);
    });

    it('retorna 404 quando não encontrado', async () => {
        const repository = buildParliamentarianRepositoryMock();
        repository.findById.mockResolvedValue(null);

        const useCase = new GetParliamentarianByIdUseCase(repository as never);
        await expect(
            useCase.execute('tenant-1', 'missing'),
        ).rejects.toBeInstanceOf(ParliamentarianNotFoundError);
    });
});
