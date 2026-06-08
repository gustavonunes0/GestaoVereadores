import { UpdateAtoUseCase } from './update-ato.use-case';
import {
    AtoDataFinalAnteriorInicialError,
    AtoNotFoundError,
    TipoAtoNotFoundError,
} from '../errors/ato.errors';
import { buildAtoEntity, buildAtoRepositoryMock } from './__tests__/ato-test.helpers';

describe('UpdateAtoUseCase', () => {
    it('atualiza ato existente', async () => {
        const repository = buildAtoRepositoryMock();
        repository.findById.mockResolvedValue(buildAtoEntity());
        repository.update.mockResolvedValue(
            buildAtoEntity({ numero: '002/2024' }),
        );

        const useCase = new UpdateAtoUseCase(repository as never);
        const result = await useCase.execute('ato-1', { numero: '002/2024' });

        expect(repository.update).toHaveBeenCalledWith('ato-1', {
            tipoId: undefined,
            classificacaoId: undefined,
            numero: '002/2024',
            dataInicio: undefined,
            dataFim: undefined,
            dataPublicacaoInicio: undefined,
            dataPublicacaoFim: undefined,
            mensagem: undefined,
        });
        expect(result.numero).toBe('002/2024');
    });

    it('falha quando ato não existe', async () => {
        const repository = buildAtoRepositoryMock();
        repository.findById.mockResolvedValue(null);

        const useCase = new UpdateAtoUseCase(repository as never);
        await expect(
            useCase.execute('missing', { numero: '002/2024' }),
        ).rejects.toBeInstanceOf(AtoNotFoundError);
    });

    it('valida tipoId ao atualizar', async () => {
        const repository = buildAtoRepositoryMock();
        repository.findById.mockResolvedValue(buildAtoEntity());
        repository.existsTipoAto.mockResolvedValue(false);

        const useCase = new UpdateAtoUseCase(repository as never);
        await expect(
            useCase.execute('ato-1', { tipoId: 'invalid' }),
        ).rejects.toBeInstanceOf(TipoAtoNotFoundError);
    });

    it('falha quando dataFim resultante é anterior a dataInicio', async () => {
        const repository = buildAtoRepositoryMock();
        repository.findById.mockResolvedValue(
            buildAtoEntity({
                dataInicio: new Date('2024-06-01'),
                dataFim: new Date('2024-12-01'),
            }),
        );

        const useCase = new UpdateAtoUseCase(repository as never);
        await expect(
            useCase.execute('ato-1', { dataFim: '2024-05-01' }),
        ).rejects.toBeInstanceOf(AtoDataFinalAnteriorInicialError);
        expect(repository.update).not.toHaveBeenCalled();
    });
});
