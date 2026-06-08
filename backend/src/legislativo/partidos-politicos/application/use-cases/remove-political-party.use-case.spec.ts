import { RemovePoliticalPartyUseCase } from './remove-political-party.use-case';
import {
    PoliticalPartyHasActiveParliamentariansError,
    PoliticalPartyNotFoundError,
} from '../errors/political-party.errors';
import {
    buildPoliticalPartyEntity,
    buildPoliticalPartyRepositoryMock,
} from './__tests__/political-party-test.helpers';

describe('RemovePoliticalPartyUseCase', () => {
    it('remove partido via soft delete', async () => {
        const repository = buildPoliticalPartyRepositoryMock();
        repository.findById.mockResolvedValue(buildPoliticalPartyEntity());
        repository.countActiveParliamentarians.mockResolvedValue(0);

        const useCase = new RemovePoliticalPartyUseCase(repository as never);
        await useCase.execute('tenant-1', 'party-1');

        expect(repository.softDelete).toHaveBeenCalledWith(
            'tenant-1',
            'party-1',
        );
    });

    it('bloqueia remoção com parlamentares ativos', async () => {
        const repository = buildPoliticalPartyRepositoryMock();
        repository.findById.mockResolvedValue(buildPoliticalPartyEntity());
        repository.countActiveParliamentarians.mockResolvedValue(1);

        const useCase = new RemovePoliticalPartyUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'party-1'),
        ).rejects.toBeInstanceOf(PoliticalPartyHasActiveParliamentariansError);
    });

    it('falha quando partido não existe', async () => {
        const repository = buildPoliticalPartyRepositoryMock();
        repository.findById.mockResolvedValue(null);

        const useCase = new RemovePoliticalPartyUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'missing'),
        ).rejects.toBeInstanceOf(PoliticalPartyNotFoundError);
    });
});
