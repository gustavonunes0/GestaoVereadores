import { GetAtoByIdUseCase } from './get-ato-by-id.use-case';
import { AtoNotFoundError } from '../errors/ato.errors';
import { buildAtoEntity, buildAtoRepositoryMock } from './__tests__/ato-test.helpers';

describe('GetAtoByIdUseCase', () => {
    it('busca ato por id', async () => {
        const repository = buildAtoRepositoryMock();
        repository.findById.mockResolvedValue(buildAtoEntity());

        const useCase = new GetAtoByIdUseCase(repository as never);
        const result = await useCase.execute('ato-1');

        expect(result.id).toBe('ato-1');
        expect(result.tipo.id).toBe('tipo-1');
        expect(result.classificacao.id).toBe('class-1');
    });

    it('retorna erro quando ato não existe', async () => {
        const repository = buildAtoRepositoryMock();
        repository.findById.mockResolvedValue(null);

        const useCase = new GetAtoByIdUseCase(repository as never);
        await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
            AtoNotFoundError,
        );
    });
});
