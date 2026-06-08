import { GetPoliticalPartyByIdUseCase } from './get-political-party-by-id.use-case';
import { PoliticalPartyNotFoundError } from '../errors/political-party.errors';
import {
    buildPoliticalPartyEntity,
    buildPoliticalPartyRepositoryMock,
} from './__tests__/political-party-test.helpers';

describe('GetPoliticalPartyByIdUseCase', () => {
    it('retorna partido do tenant', async () => {
        const repository = buildPoliticalPartyRepositoryMock();
        repository.findById.mockResolvedValue(buildPoliticalPartyEntity());

        const useCase = new GetPoliticalPartyByIdUseCase(repository as never);
        const result = await useCase.execute('tenant-1', 'party-1');

        expect(result.id).toBe('party-1');
        expect(result.acronym).toBe('PT');
    });

    it('falha quando partido não existe', async () => {
        const repository = buildPoliticalPartyRepositoryMock();
        repository.findById.mockResolvedValue(null);

        const useCase = new GetPoliticalPartyByIdUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'missing'),
        ).rejects.toBeInstanceOf(PoliticalPartyNotFoundError);
    });
});
