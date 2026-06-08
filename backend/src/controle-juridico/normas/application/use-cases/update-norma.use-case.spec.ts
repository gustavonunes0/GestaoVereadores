import { UpdateNormaUseCase } from './update-norma.use-case';
import {
    MateriaNaoPodeGerarNormaError,
    NormaNotFoundError,
} from '../errors/norma.errors';
import {
    buildMateriaOrigemValidatorMock,
    buildNormaEntity,
    buildNormaRepositoryMock,
} from './__tests__/norma-test.helpers';

describe('UpdateNormaUseCase', () => {
    it('atualiza norma existente', async () => {
        const repository = buildNormaRepositoryMock();
        repository.findById.mockResolvedValue(buildNormaEntity());
        repository.update.mockResolvedValue(
            buildNormaEntity({ numero: '002/2024' }),
        );

        const useCase = new UpdateNormaUseCase(
            repository as never,
            buildMateriaOrigemValidatorMock() as never,
        );
        const result = await useCase.execute('tenant-1', 'norma-1', {
            numero: '002/2024',
        });

        expect(repository.update).toHaveBeenCalledWith(
            'tenant-1',
            'norma-1',
            expect.objectContaining({ numero: '002/2024' }),
        );
        expect(result.numero).toBe('002/2024');
    });

    it('falha quando norma não existe', async () => {
        const repository = buildNormaRepositoryMock();
        repository.findById.mockResolvedValue(null);

        const useCase = new UpdateNormaUseCase(
            repository as never,
            buildMateriaOrigemValidatorMock() as never,
        );
        await expect(
            useCase.execute('tenant-1', 'missing', { numero: '002/2024' }),
        ).rejects.toBeInstanceOf(NormaNotFoundError);
    });

    it('valida materiaOrigemId quando alterado', async () => {
        const repository = buildNormaRepositoryMock();
        const materiaValidator = buildMateriaOrigemValidatorMock();
        repository.findById.mockResolvedValue(buildNormaEntity());
        repository.update.mockResolvedValue(buildNormaEntity());

        const useCase = new UpdateNormaUseCase(
            repository as never,
            materiaValidator as never,
        );
        await useCase.execute('tenant-1', 'norma-1', {
            materiaOrigemId: 'materia-1',
        });

        expect(materiaValidator.validate).toHaveBeenCalledWith(
            'tenant-1',
            'materia-1',
        );
    });

    it('falha quando matéria de origem não pode gerar norma', async () => {
        const repository = buildNormaRepositoryMock();
        const materiaValidator = buildMateriaOrigemValidatorMock();
        repository.findById.mockResolvedValue(buildNormaEntity());
        materiaValidator.validate.mockRejectedValue(
            new MateriaNaoPodeGerarNormaError(),
        );

        const useCase = new UpdateNormaUseCase(
            repository as never,
            materiaValidator as never,
        );

        await expect(
            useCase.execute('tenant-1', 'norma-1', {
                materiaOrigemId: 'materia-arquivada',
            }),
        ).rejects.toBeInstanceOf(MateriaNaoPodeGerarNormaError);
        expect(repository.update).not.toHaveBeenCalled();
    });
});
