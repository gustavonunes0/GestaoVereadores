import { GetLegislatureByIdUseCase } from './get-legislature-by-id.use-case';
import { LegislatureNotFoundError } from '../errors/legislature.errors';
import {
    buildLegislatureEntity,
    buildLegislatureRepositoryMock,
} from './__tests__/legislature-test.helpers';

describe('GetLegislatureByIdUseCase', () => {
    it('retorna legislatura do tenant', async () => {
        const repository = buildLegislatureRepositoryMock();
        repository.findById.mockResolvedValue(buildLegislatureEntity());

        const useCase = new GetLegislatureByIdUseCase(repository as never);
        const result = await useCase.execute('tenant-1', 'leg-1');

        expect(result.id).toBe('leg-1');
        expect(result.number).toBe(20);
    });

    it('falha quando legislatura não existe', async () => {
        const repository = buildLegislatureRepositoryMock();
        repository.findById.mockResolvedValue(null);

        const useCase = new GetLegislatureByIdUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'missing'),
        ).rejects.toBeInstanceOf(LegislatureNotFoundError);
    });
});
