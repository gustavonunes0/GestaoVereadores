import { CommitteeType } from '../../domain/enums/committee-type.enum';
import { CreateComissaoUseCase } from './create-comissao.use-case';
import {
    ComissaoAcronymAlreadyInUseError,
    ComissaoInvalidDateRangeError,
    ComissaoPurposeRequiredError,
} from '../errors/comissao.errors';
import {
    buildCommitteeEntity,
    buildCommitteeRepositoryMock,
    buildCommitteeWithRelations,
} from './__tests__/comissao-test.helpers';

describe('CreateComissaoUseCase', () => {
    const dto = {
        name: 'Comissão de Finanças e Orçamento',
        acronym: 'CFO',
        type: CommitteeType.PERMANENT,
        purpose:
            'Compete analisar proposta orçamentária e matérias de impacto fiscal.',
    };

    it('cadastra comissão permanente com finalidade', async () => {
        const repository = buildCommitteeRepositoryMock();
        repository.existsByAcronym.mockResolvedValue(false);
        repository.create.mockResolvedValue(buildCommitteeWithRelations());

        const useCase = new CreateComissaoUseCase(repository as never);
        const result = await useCase.execute('tenant-1', dto);

        expect(result.name).toBe('Comissão de Finanças');
        expect(result.type).toBe(CommitteeType.PERMANENT);
        expect(result.purpose).toContain('financeiras');
    });

    it('cadastra comissão temporária com período opcional', async () => {
        const repository = buildCommitteeRepositoryMock();
        repository.existsByAcronym.mockResolvedValue(false);
        repository.create.mockResolvedValue(
            buildCommitteeWithRelations({
                entity: buildCommitteeEntity({
                    type: CommitteeType.TEMPORARY,
                    startDate: new Date('2025-01-01'),
                    endDate: new Date('2025-06-30'),
                }),
            }),
        );

        const useCase = new CreateComissaoUseCase(repository as never);
        await useCase.execute('tenant-1', {
            ...dto,
            type: CommitteeType.TEMPORARY,
            startDate: '2025-01-01',
            endDate: '2025-06-30',
        });

        expect(repository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                type: CommitteeType.TEMPORARY,
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-06-30'),
            }),
        );
    });

    it('bloqueia sigla duplicada no tenant', async () => {
        const repository = buildCommitteeRepositoryMock();
        repository.existsByAcronym.mockResolvedValue(true);

        const useCase = new CreateComissaoUseCase(repository as never);

        await expect(useCase.execute('tenant-1', dto)).rejects.toBeInstanceOf(
            ComissaoAcronymAlreadyInUseError,
        );
    });

    it('bloqueia finalidade vazia', async () => {
        const useCase = new CreateComissaoUseCase(
            buildCommitteeRepositoryMock() as never,
        );

        await expect(
            useCase.execute('tenant-1', { ...dto, purpose: '   ' }),
        ).rejects.toBeInstanceOf(ComissaoPurposeRequiredError);
    });

    it('bloqueia data fim inválida', async () => {
        const repository = buildCommitteeRepositoryMock();
        repository.existsByAcronym.mockResolvedValue(false);

        const useCase = new CreateComissaoUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', {
                ...dto,
                startDate: '2026-01-01',
                endDate: '2025-01-01',
            }),
        ).rejects.toBeInstanceOf(ComissaoInvalidDateRangeError);
    });
});
