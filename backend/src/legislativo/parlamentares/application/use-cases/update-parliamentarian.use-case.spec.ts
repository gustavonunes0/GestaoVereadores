import { UpdateParliamentarianUseCase } from './update-parliamentarian.use-case';
import { ParliamentarianNotFoundError } from '../errors/parliamentarian.errors';
import {
    buildParliamentarianRepositoryMock,
    buildParliamentarianWithRelations,
    buildParlamentarianUserRepositoryMock,
    buildPoliticalPartyRepositoryMock,
} from './__tests__/parliamentarian-test.helpers';

describe('UpdateParliamentarianUseCase', () => {
    it('atualiza parlamentar existente', async () => {
        const repository = buildParliamentarianRepositoryMock();
        const withRelations = buildParliamentarianWithRelations();
        repository.findById
            .mockResolvedValueOnce(withRelations)
            .mockResolvedValueOnce(withRelations);
        repository.update.mockResolvedValue(withRelations);

        const useCase = new UpdateParliamentarianUseCase(
            repository as never,
            buildParlamentarianUserRepositoryMock() as never,
            buildPoliticalPartyRepositoryMock() as never,
        );
        const result = await useCase.execute('tenant-1', 'parl-1', {
            parliamentaryName: 'Novo Nome',
        });

        expect(repository.update).toHaveBeenCalled();
        expect(result.parliamentaryName).toBeDefined();
    });

    it('falha quando parlamentar não existe', async () => {
        const repository = buildParliamentarianRepositoryMock();
        repository.findById.mockResolvedValue(null);

        const useCase = new UpdateParliamentarianUseCase(
            repository as never,
            buildParlamentarianUserRepositoryMock() as never,
            buildPoliticalPartyRepositoryMock() as never,
        );

        await expect(
            useCase.execute('tenant-1', 'missing', { parliamentaryName: 'X' }),
        ).rejects.toBeInstanceOf(ParliamentarianNotFoundError);
    });
});
