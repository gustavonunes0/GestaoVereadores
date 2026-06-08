import { UpdatePoliticalPartyUseCase } from './update-political-party.use-case';
import {
    PoliticalPartyAcronymAlreadyInUseError,
    PoliticalPartyNameAlreadyInUseError,
    PoliticalPartyNotFoundError,
} from '../errors/political-party.errors';
import {
    buildPoliticalPartyEntity,
    buildPoliticalPartyRepositoryMock,
} from './__tests__/political-party-test.helpers';

describe('UpdatePoliticalPartyUseCase', () => {
    it('atualiza partido existente', async () => {
        const repository = buildPoliticalPartyRepositoryMock();
        repository.findById.mockResolvedValue(buildPoliticalPartyEntity());
        repository.update.mockResolvedValue(
            buildPoliticalPartyEntity({ name: 'Partido Atualizado' }),
        );

        const useCase = new UpdatePoliticalPartyUseCase(repository as never);
        const result = await useCase.execute('tenant-1', 'party-1', {
            name: 'Partido Atualizado',
        });

        expect(result.name).toBe('Partido Atualizado');
    });

    it('bloqueia sigla duplicada', async () => {
        const repository = buildPoliticalPartyRepositoryMock();
        repository.findById.mockResolvedValue(buildPoliticalPartyEntity());
        repository.existsByAcronym.mockResolvedValue(true);

        const useCase = new UpdatePoliticalPartyUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'party-1', { acronym: 'PSDB' }),
        ).rejects.toBeInstanceOf(PoliticalPartyAcronymAlreadyInUseError);
    });

    it('bloqueia nome duplicado', async () => {
        const repository = buildPoliticalPartyRepositoryMock();
        repository.findById.mockResolvedValue(buildPoliticalPartyEntity());
        repository.existsByName.mockResolvedValue(true);

        const useCase = new UpdatePoliticalPartyUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'party-1', { name: 'Outro Nome' }),
        ).rejects.toBeInstanceOf(PoliticalPartyNameAlreadyInUseError);
    });

    it('falha quando partido não existe no tenant', async () => {
        const repository = buildPoliticalPartyRepositoryMock();
        repository.findById.mockResolvedValue(null);

        const useCase = new UpdatePoliticalPartyUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'missing', { name: 'X' }),
        ).rejects.toBeInstanceOf(PoliticalPartyNotFoundError);
    });
});
