import { SessionStatus } from '../enums/session-status.enum';
import { SessionLifecycleAction } from '../enums/session-lifecycle-action.enum';
import { PlenarySessionDomainService } from './plenary-session-domain.service';

describe('PlenarySessionDomainService', () => {
    const service = new PlenarySessionDomainService();

    it('inicia sessão em AGENDADA', () => {
        expect(service.getDefaultStatus()).toBe(SessionStatus.AGENDADA);
    });

    it('valida intervalo de datas', () => {
        const inicio = new Date('2026-06-01T19:00:00');
        const fim = new Date('2026-06-01T22:00:00');
        expect(() => service.assertDateRange(inicio, fim)).not.toThrow();
        expect(() =>
            service.assertDateRange(fim, inicio),
        ).toThrow('Data fim não pode ser anterior');
    });

    it('expõe capacidades por status', () => {
        const agendada = service.getWorkflowCapabilities(SessionStatus.AGENDADA);
        expect(agendada.canStart).toBe(true);
        expect(agendada.canManageAgenda).toBe(false);

        const andamento = service.getWorkflowCapabilities(
            SessionStatus.EM_ANDAMENTO,
        );
        expect(andamento.canManageAgenda).toBe(true);
        expect(andamento.canEnd).toBe(true);

        const encerrada = service.getWorkflowCapabilities(
            SessionStatus.ENCERRADA,
        );
        expect(encerrada.canRegisterPresence).toBe(false);
    });

    it('define transições via ações de ciclo de vida', () => {
        expect(
            service.getAllowedTransitions(SessionStatus.AGENDADA),
        ).toEqual(
            expect.arrayContaining([
                SessionStatus.EM_ANDAMENTO,
                SessionStatus.CANCELADA,
            ]),
        );
        expect(
            service.getLifecycleService().getAvailableActions(
                SessionStatus.EM_ANDAMENTO,
            ),
        ).toContain(SessionLifecycleAction.ENCERRAR);
    });
});
