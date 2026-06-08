import { CreateAtoUseCase } from './create-ato.use-case';
import {
    AtoDataFinalAnteriorInicialError,
    AtoDataPublicacaoFinalAnteriorInicialError,
    AtoNumeroAlreadyInUseError,
    ClassificacaoAtoNotFoundError,
    TipoAtoNotFoundError,
} from '../errors/ato.errors';
import {
    buildAtoEntity,
    buildAtoRepositoryMock,
} from './__tests__/ato-test.helpers';

describe('CreateAtoUseCase', () => {
    const dto = {
        tipoId: 'tipo-1',
        classificacaoId: 'class-1',
        numero: '001/2024',
    };

    it('cria ato validando tipoId e classificacaoId', async () => {
        const repository = buildAtoRepositoryMock();
        repository.existsTipoAto.mockResolvedValue(true);
        repository.existsClassificacaoAto.mockResolvedValue(true);
        repository.existsByNumero.mockResolvedValue(false);
        repository.create.mockResolvedValue(buildAtoEntity());

        const useCase = new CreateAtoUseCase(repository as never);
        const result = await useCase.execute(dto);

        expect(repository.existsTipoAto).toHaveBeenCalledWith('tipo-1');
        expect(repository.existsClassificacaoAto).toHaveBeenCalledWith('class-1');
        expect(result.tipo).toEqual({ id: 'tipo-1', nome: 'Portaria' });
        expect(result.classificacao).toEqual({
            id: 'class-1',
            nome: 'Administrativo',
        });
    });

    it('falha quando tipoId não existe', async () => {
        const repository = buildAtoRepositoryMock();
        repository.existsTipoAto.mockResolvedValue(false);

        const useCase = new CreateAtoUseCase(repository as never);
        await expect(useCase.execute(dto)).rejects.toBeInstanceOf(
            TipoAtoNotFoundError,
        );
    });

    it('falha quando classificacaoId não existe', async () => {
        const repository = buildAtoRepositoryMock();
        repository.existsTipoAto.mockResolvedValue(true);
        repository.existsClassificacaoAto.mockResolvedValue(false);

        const useCase = new CreateAtoUseCase(repository as never);
        await expect(useCase.execute(dto)).rejects.toBeInstanceOf(
            ClassificacaoAtoNotFoundError,
        );
    });

    it('falha quando número já existe', async () => {
        const repository = buildAtoRepositoryMock();
        repository.existsTipoAto.mockResolvedValue(true);
        repository.existsClassificacaoAto.mockResolvedValue(true);
        repository.existsByNumero.mockResolvedValue(true);

        const useCase = new CreateAtoUseCase(repository as never);
        await expect(useCase.execute(dto)).rejects.toBeInstanceOf(
            AtoNumeroAlreadyInUseError,
        );
    });

    it('falha quando dataFim é anterior a dataInicio', async () => {
        const repository = buildAtoRepositoryMock();
        repository.existsTipoAto.mockResolvedValue(true);
        repository.existsClassificacaoAto.mockResolvedValue(true);
        repository.existsByNumero.mockResolvedValue(false);

        const useCase = new CreateAtoUseCase(repository as never);
        await expect(
            useCase.execute({
                ...dto,
                dataInicio: '2024-06-01',
                dataFim: '2024-05-01',
            }),
        ).rejects.toBeInstanceOf(AtoDataFinalAnteriorInicialError);
        expect(repository.create).not.toHaveBeenCalled();
    });

    it('falha quando dataPublicacaoFim é anterior a dataPublicacaoInicio', async () => {
        const repository = buildAtoRepositoryMock();
        repository.existsTipoAto.mockResolvedValue(true);
        repository.existsClassificacaoAto.mockResolvedValue(true);
        repository.existsByNumero.mockResolvedValue(false);

        const useCase = new CreateAtoUseCase(repository as never);
        await expect(
            useCase.execute({
                ...dto,
                dataPublicacaoInicio: '2024-06-01',
                dataPublicacaoFim: '2024-05-01',
            }),
        ).rejects.toBeInstanceOf(
            AtoDataPublicacaoFinalAnteriorInicialError,
        );
        expect(repository.create).not.toHaveBeenCalled();
    });
});
