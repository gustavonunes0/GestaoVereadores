import { SessionLifecycleAction } from '../enums/session-lifecycle-action.enum';
import { SessionStatus } from '../enums/session-status.enum';
import { SessionLifecycleDomainService } from './session-lifecycle-domain.service';

describe('SessionLifecycleDomainService', () => {
    const service = new SessionLifecycleDomainService();

    it('inicia sessão AGENDADA com ação INICIAR', () => {
        expect(service.getAvailableActions(SessionStatus.AGENDADA)).toContain(
            SessionLifecycleAction.INICIAR,
        );
        expect(
            service.resolveTransition(
                SessionStatus.AGENDADA,
                SessionLifecycleAction.INICIAR,
            ),
        ).toBe(SessionStatus.EM_ANDAMENTO);
    });

    it('permite encerrar sessão em andamento', () => {
        expect(
            service.resolveTransition(
                SessionStatus.EM_ANDAMENTO,
                SessionLifecycleAction.ENCERRAR,
            ),
        ).toBe(SessionStatus.ENCERRADA);
    });

    it('permite cancelar sessão agendada ou em andamento', () => {
        expect(
            service.resolveTransition(
                SessionStatus.AGENDADA,
                SessionLifecycleAction.CANCELAR,
            ),
        ).toBe(SessionStatus.CANCELADA);
        expect(
            service.resolveTransition(
                SessionStatus.EM_ANDAMENTO,
                SessionLifecycleAction.CANCELAR,
            ),
        ).toBe(SessionStatus.CANCELADA);
    });

    it('bloqueia ação inválida no status terminal', () => {
        expect(() =>
            service.resolveTransition(
                SessionStatus.ENCERRADA,
                SessionLifecycleAction.INICIAR,
            ),
        ).toThrow('Ação INICIAR não permitida no status ENCERRADA');
    });
});
