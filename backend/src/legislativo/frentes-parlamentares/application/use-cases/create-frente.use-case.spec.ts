import { CreateFrenteUseCase } from './create-frente.use-case';
import {
    FrenteInvalidDateRangeError,
    FrenteThemeRequiredError,
} from '../errors/frente.errors';
import {
    buildParliamentaryFrontRepositoryMock,
    buildParliamentaryFrontWithRelations,
} from './__tests__/frente-test.helpers';

describe('CreateFrenteUseCase', () => {
    const dto = {
        name: 'Frente Parlamentar da Educação',
        theme: 'Educação',
        description: 'Defesa da educação pública municipal.',
    };

    it('cadastra frente por tema dentro da Câmara', async () => {
        const repository = buildParliamentaryFrontRepositoryMock();
        repository.create.mockResolvedValue(buildParliamentaryFrontWithRelations());

        const useCase = new CreateFrenteUseCase(
            repository as never,
            { findById: jest.fn() } as never,
            { findByIdForTenant: jest.fn() } as never,
        );

        const result = await useCase.execute('tenant-1', dto);
        expect(result.theme).toBe('Educação');
        expect(repository.create).toHaveBeenCalledWith(
            expect.objectContaining({ tenantId: 'tenant-1', theme: 'Educação' }),
        );
    });

    it('bloqueia tema vazio', async () => {
        const useCase = new CreateFrenteUseCase(
            buildParliamentaryFrontRepositoryMock() as never,
            { findById: jest.fn() } as never,
            { findByIdForTenant: jest.fn() } as never,
        );

        await expect(
            useCase.execute('tenant-1', { ...dto, theme: '   ' }),
        ).rejects.toBeInstanceOf(FrenteThemeRequiredError);
    });

    it('bloqueia data fim inválida', async () => {
        const useCase = new CreateFrenteUseCase(
            buildParliamentaryFrontRepositoryMock() as never,
            { findById: jest.fn() } as never,
            { findByIdForTenant: jest.fn() } as never,
        );

        await expect(
            useCase.execute('tenant-1', {
                ...dto,
                startDate: '2026-01-01',
                endDate: '2025-01-01',
            }),
        ).rejects.toBeInstanceOf(FrenteInvalidDateRangeError);
    });
});
