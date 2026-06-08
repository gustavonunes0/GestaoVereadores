import { UpdateLegislatureUseCase } from './update-legislature.use-case';
import {
    LegislatureNotFoundError,
    LegislatureNumberAlreadyInUseError,
} from '../errors/legislature.errors';
import {
    buildLegislatureEntity,
    buildLegislatureRepositoryMock,
} from './__tests__/legislature-test.helpers';

describe('UpdateLegislatureUseCase', () => {
    it('atualiza legislatura existente', async () => {
        const existing = buildLegislatureEntity();
        const repository = buildLegislatureRepositoryMock();
        repository.findById.mockResolvedValue(existing);
        repository.update.mockResolvedValue(
            buildLegislatureEntity({ number: 22 }),
        );

        const useCase = new UpdateLegislatureUseCase(repository as never);
        const result = await useCase.execute('tenant-1', 'leg-1', {
            number: 22,
        });

        expect(result.number).toBe(22);
    });

    it('bloqueia número duplicado no tenant', async () => {
        const repository = buildLegislatureRepositoryMock();
        repository.findById.mockResolvedValue(buildLegislatureEntity());
        repository.existsByNumber.mockResolvedValue(true);

        const useCase = new UpdateLegislatureUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'leg-1', { number: 19 }),
        ).rejects.toBeInstanceOf(LegislatureNumberAlreadyInUseError);
    });

    it('falha quando legislatura não pertence ao tenant', async () => {
        const repository = buildLegislatureRepositoryMock();
        repository.findById.mockResolvedValue(null);

        const useCase = new UpdateLegislatureUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'leg-1', { number: 22 }),
        ).rejects.toBeInstanceOf(LegislatureNotFoundError);
    });

    it('permite marcar legislatura como atual', async () => {
        const repository = buildLegislatureRepositoryMock();
        repository.findById.mockResolvedValue(buildLegislatureEntity());
        repository.update.mockResolvedValue(
            buildLegislatureEntity({ isCurrent: true }),
        );
        repository.countCurrentLegislatures.mockResolvedValue(1);

        const useCase = new UpdateLegislatureUseCase(repository as never);
        const result = await useCase.execute('tenant-1', 'leg-1', {
            isCurrent: true,
        });

        expect(result.isCurrent).toBe(true);
        expect(repository.update).toHaveBeenCalledWith(
            'tenant-1',
            'leg-1',
            expect.objectContaining({ isCurrent: true }),
        );
    });
});
