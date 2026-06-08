import { SessionLifecycleAction } from '../enums/session-lifecycle-action.enum';
import { SessionStatus } from '../enums/session-status.enum';

type ActionRule = {
    from: SessionStatus[];
    to: SessionStatus;
    defaultObservacao: string;
};

const ACTION_RULES: Record<SessionLifecycleAction, ActionRule> = {
    [SessionLifecycleAction.INICIAR]: {
        from: [SessionStatus.AGENDADA],
        to: SessionStatus.EM_ANDAMENTO,
        defaultObservacao: 'Sessão iniciada',
    },
    [SessionLifecycleAction.ENCERRAR]: {
        from: [SessionStatus.EM_ANDAMENTO],
        to: SessionStatus.ENCERRADA,
        defaultObservacao: 'Sessão encerrada',
    },
    [SessionLifecycleAction.CANCELAR]: {
        from: [SessionStatus.AGENDADA, SessionStatus.EM_ANDAMENTO],
        to: SessionStatus.CANCELADA,
        defaultObservacao: 'Sessão cancelada',
    },
};

/**
 * Ciclo de vida da sessão plenária — situação só muda por ações explícitas (task 22).
 */
export class SessionLifecycleDomainService {
    resolveTransition(
        currentStatus: SessionStatus,
        action: SessionLifecycleAction,
    ): SessionStatus {
        const rule = ACTION_RULES[action];
        if (!rule.from.includes(currentStatus)) {
            throw new Error(
                `Ação ${action} não permitida no status ${currentStatus}`,
            );
        }
        return rule.to;
    }

    getAvailableActions(
        currentStatus: SessionStatus,
    ): SessionLifecycleAction[] {
        return (
            Object.entries(ACTION_RULES) as [
                SessionLifecycleAction,
                ActionRule,
            ][]
        )
            .filter(([, rule]) => rule.from.includes(currentStatus))
            .map(([action]) => action);
    }

    getDefaultObservacao(action: SessionLifecycleAction): string {
        return ACTION_RULES[action].defaultObservacao;
    }

    getAllActionRules() {
        return Object.entries(ACTION_RULES).map(([action, rule]) => ({
            action: action as SessionLifecycleAction,
            from: rule.from,
            to: rule.to,
        }));
    }
}
