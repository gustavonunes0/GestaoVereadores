import { AgendaInvalidDateRangeError, AgendaNotFoundError } from '../errors/agenda.errors';
import { UpdateAgendaUseCase } from './update-agenda.use-case';
import {
    buildAgendaEntity,
    buildAgendaRepositoryMock,
} from './__tests__/agenda-test.helpers';

describe('UpdateAgendaUseCase', () => {
    it('atualiza evento existente', async () => {
        const repository = buildAgendaRepositoryMock();
        repository.findOne.mockResolvedValue(buildAgendaEntity());
        repository.update.mockResolvedValue(
            buildAgendaEntity({ titulo: 'Sessão Extraordinária' }),
        );

        const useCase = new UpdateAgendaUseCase(repository as never);
        const result = await useCase.execute('tenant-1', 'agenda-1', {
            titulo: 'Sessão Extraordinária',
        });

        expect(result.titulo).toBe('Sessão Extraordinária');
    });

    it('falha quando agenda não existe', async () => {
        const repository = buildAgendaRepositoryMock();
        repository.findOne.mockResolvedValue(null);

        const useCase = new UpdateAgendaUseCase(repository as never);
        await expect(
            useCase.execute('tenant-1', 'missing', { titulo: 'X' }),
        ).rejects.toBeInstanceOf(AgendaNotFoundError);
    });

    it('falha quando intervalo de datas fica inválido', async () => {
        const repository = buildAgendaRepositoryMock();
        repository.findOne.mockResolvedValue(
            buildAgendaEntity({
                dataInicio: new Date('2024-06-01'),
                dataFim: new Date('2024-06-02'),
            }),
        );

        const useCase = new UpdateAgendaUseCase(repository as never);
        await expect(
            useCase.execute('tenant-1', 'agenda-1', { dataFim: '2024-05-01' }),
        ).rejects.toBeInstanceOf(AgendaInvalidDateRangeError);
        expect(repository.update).not.toHaveBeenCalled();
    });
});
