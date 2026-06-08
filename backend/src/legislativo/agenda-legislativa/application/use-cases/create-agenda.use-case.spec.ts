import { AgendaEventType } from '../../domain/enums/agenda-event-type.enum';
import { CreateAgendaUseCase } from './create-agenda.use-case';
import { AgendaInvalidDateRangeError } from '../errors/agenda.errors';
import {
    buildAgendaEntity,
    buildAgendaRepositoryMock,
} from './__tests__/agenda-test.helpers';

describe('CreateAgendaUseCase', () => {
    const dto = {
        tipo: AgendaEventType.REUNIAO,
        titulo: 'Reunião de líderes',
        dataInicio: '2024-06-01T10:00:00.000Z',
        dataFim: '2024-06-01T12:00:00.000Z',
    };

    it('cria evento no calendário', async () => {
        const repository = buildAgendaRepositoryMock();
        repository.create.mockResolvedValue(buildAgendaEntity());

        const useCase = new CreateAgendaUseCase(repository as never);
        const result = await useCase.execute('tenant-1', dto);

        expect(repository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                tenantId: 'tenant-1',
                tipo: AgendaEventType.REUNIAO,
            }),
        );
        expect(result.tipo).toBe(AgendaEventType.SESSAO);
        expect(result.tipoLabel).toBe('Sessão');
    });

    it('falha quando dataFim é anterior a dataInicio', async () => {
        const repository = buildAgendaRepositoryMock();
        const useCase = new CreateAgendaUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', {
                ...dto,
                dataInicio: '2024-06-02',
                dataFim: '2024-06-01',
            }),
        ).rejects.toBeInstanceOf(AgendaInvalidDateRangeError);
        expect(repository.create).not.toHaveBeenCalled();
    });
});
