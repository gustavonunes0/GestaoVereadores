import { CreatePoliticalPartyUseCase } from './create-political-party.use-case';
import {
    PoliticalPartyAcronymAlreadyInUseError,
    PoliticalPartyNameAlreadyInUseError,
} from '../errors/political-party.errors';
import {
    buildPoliticalPartyEntity,
    buildPoliticalPartyRepositoryMock,
} from './__tests__/political-party-test.helpers';

describe('CreatePoliticalPartyUseCase', () => {
    const dto = {
        name: 'Partido Verde',
        acronym: 'pv',
        ideology: 'Ecologia',
        flagUrl: 'https://example.com/pv.png',
    };

    it('cria partido vinculado ao tenant', async () => {
        const repository = buildPoliticalPartyRepositoryMock();
        repository.existsByAcronym.mockResolvedValue(false);
        repository.existsByName.mockResolvedValue(false);
        repository.findRemovedByAcronym.mockResolvedValue(null);
        repository.create.mockResolvedValue(
            buildPoliticalPartyEntity({ name: 'Partido Verde', acronym: 'PV' }),
        );

        const useCase = new CreatePoliticalPartyUseCase(repository as never);
        const result = await useCase.execute('tenant-1', dto);

        expect(result.acronym).toBe('PV');
        expect(repository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                tenantId: 'tenant-1',
                ideology: 'Ecologia',
                flagUrl: 'https://example.com/pv.png',
            }),
        );
    });

    it('bloqueia sigla duplicada no tenant', async () => {
        const repository = buildPoliticalPartyRepositoryMock();
        repository.existsByAcronym.mockResolvedValue(true);

        const useCase = new CreatePoliticalPartyUseCase(repository as never);

        await expect(useCase.execute('tenant-1', dto)).rejects.toBeInstanceOf(
            PoliticalPartyAcronymAlreadyInUseError,
        );
    });

    it('bloqueia nome duplicado no tenant', async () => {
        const repository = buildPoliticalPartyRepositoryMock();
        repository.existsByAcronym.mockResolvedValue(false);
        repository.existsByName.mockResolvedValue(true);

        const useCase = new CreatePoliticalPartyUseCase(repository as never);

        await expect(useCase.execute('tenant-1', dto)).rejects.toBeInstanceOf(
            PoliticalPartyNameAlreadyInUseError,
        );
    });

    it('reativa partido removido com mesma sigla', async () => {
        const repository = buildPoliticalPartyRepositoryMock();
        repository.existsByAcronym.mockResolvedValue(false);
        repository.existsByName.mockResolvedValue(false);
        repository.findRemovedByAcronym.mockResolvedValue(
            buildPoliticalPartyEntity({ isRemoved: true }),
        );
        repository.reactivate.mockResolvedValue(buildPoliticalPartyEntity());

        const useCase = new CreatePoliticalPartyUseCase(repository as never);
        await useCase.execute('tenant-1', dto);

        expect(repository.reactivate).toHaveBeenCalled();
        expect(repository.create).not.toHaveBeenCalled();
    });
});
