import { ListAgendaTiposUseCase } from '../use-cases/list-agenda-tipos.use-case';
import { AgendaEventType } from '../../domain/enums/agenda-event-type.enum';

describe('ListAgendaTiposUseCase', () => {
    it('lista tipos de evento do calendário', () => {
        const useCase = new ListAgendaTiposUseCase();
        const tipos = useCase.execute();

        expect(tipos).toEqual(
            expect.arrayContaining([
                { value: AgendaEventType.SESSAO, label: 'Sessão' },
                { value: AgendaEventType.REUNIAO, label: 'Reunião' },
                { value: AgendaEventType.AUDIENCIA, label: 'Audiência' },
            ]),
        );
        expect(tipos).toHaveLength(5);
    });
});
