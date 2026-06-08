import { CreateNormaUseCase } from './create-norma.use-case';
import {
    AnoNotFoundError,
    MateriaNaoPodeGerarNormaError,
    TipoNormaNotFoundError,
} from '../errors/norma.errors';
import {
    buildMateriaOrigemValidatorMock,
    buildNormaEntity,
    buildNormaRepositoryMock,
} from './__tests__/norma-test.helpers';

describe('CreateNormaUseCase', () => {
    const dto = {
        tipoId: 'tipo-1',
        numero: '001/2024',
        ementa: 'Dispõe sobre testes',
    };

    it('cria norma validando tipoId', async () => {
        const repository = buildNormaRepositoryMock();
        const materiaValidator = buildMateriaOrigemValidatorMock();
        repository.existsTipoNorma.mockResolvedValue(true);
        repository.create.mockResolvedValue(buildNormaEntity());

        const useCase = new CreateNormaUseCase(
            repository as never,
            materiaValidator as never,
        );
        const result = await useCase.execute('tenant-1', dto);

        expect(repository.existsTipoNorma).toHaveBeenCalledWith('tipo-1');
        expect(repository.create).toHaveBeenCalledWith(
            'tenant-1',
            expect.objectContaining({ tipoId: 'tipo-1' }),
        );
        expect(result.tipo).toEqual({ id: 'tipo-1', nome: 'Lei' });
    });

    it('falha quando tipoId não existe', async () => {
        const repository = buildNormaRepositoryMock();
        repository.existsTipoNorma.mockResolvedValue(false);

        const useCase = new CreateNormaUseCase(
            repository as never,
            buildMateriaOrigemValidatorMock() as never,
        );
        await expect(useCase.execute('tenant-1', dto)).rejects.toBeInstanceOf(
            TipoNormaNotFoundError,
        );
    });

    it('valida anoId quando informado', async () => {
        const repository = buildNormaRepositoryMock();
        repository.existsTipoNorma.mockResolvedValue(true);
        repository.existsAno.mockResolvedValue(false);

        const useCase = new CreateNormaUseCase(
            repository as never,
            buildMateriaOrigemValidatorMock() as never,
        );
        await expect(
            useCase.execute('tenant-1', { ...dto, anoId: 'invalid' }),
        ).rejects.toBeInstanceOf(AnoNotFoundError);
    });

    it('valida materiaOrigemId quando informado', async () => {
        const repository = buildNormaRepositoryMock();
        const materiaValidator = buildMateriaOrigemValidatorMock();
        repository.existsTipoNorma.mockResolvedValue(true);
        repository.create.mockResolvedValue(buildNormaEntity());

        const useCase = new CreateNormaUseCase(
            repository as never,
            materiaValidator as never,
        );
        await useCase.execute('tenant-1', {
            ...dto,
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
        repository.existsTipoNorma.mockResolvedValue(true);
        materiaValidator.validate.mockRejectedValue(
            new MateriaNaoPodeGerarNormaError(),
        );

        const useCase = new CreateNormaUseCase(
            repository as never,
            materiaValidator as never,
        );

        await expect(
            useCase.execute('tenant-1', {
                ...dto,
                materiaOrigemId: 'materia-rejeitada',
            }),
        ).rejects.toBeInstanceOf(MateriaNaoPodeGerarNormaError);
        expect(repository.create).not.toHaveBeenCalled();
    });
});
