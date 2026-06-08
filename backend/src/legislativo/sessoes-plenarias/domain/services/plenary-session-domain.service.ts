import { SessionStatus } from '../enums/session-status.enum';
import { SessionType } from '../enums/session-type.enum';
import {
    SessionLifecycleEntry,
    SessionWorkflowCapabilities,
} from '../types/session-workflow.types';
import { SessionLifecycleDomainService } from './session-lifecycle-domain.service';

/**
 * Regras base da sessão plenária (task 22).
 */
export class PlenarySessionDomainService {
    private readonly lifecycle = new SessionLifecycleDomainService();

    assertTenantIdProvided(tenantId?: string) {
        if (!tenantId?.trim()) {
            throw new Error('Tenant é obrigatório para sessão plenária');
        }
    }

    getDefaultStatus(): SessionStatus {
        return SessionStatus.AGENDADA;
    }

    assertDateRange(dataInicio: Date, dataFim?: Date | null) {
        if (dataFim && dataFim.getTime() < dataInicio.getTime()) {
            throw new Error('Data fim não pode ser anterior à data início');
        }
    }

    getAllowedTransitions(status: SessionStatus): SessionStatus[] {
        const actions = this.lifecycle.getAvailableActions(status);
        const targets = actions.map((action) =>
            this.lifecycle.resolveTransition(status, action),
        );
        return [...new Set(targets)];
    }

    getAllStatusTransitions() {
        return this.lifecycle.getAllActionRules().map((rule) => ({
            from: rule.from,
            to: rule.to,
            action: rule.action,
        }));
    }

    getWorkflowCapabilities(status: SessionStatus): SessionWorkflowCapabilities {
        const active = status === SessionStatus.EM_ANDAMENTO;
        const terminal =
            status === SessionStatus.ENCERRADA ||
            status === SessionStatus.CANCELADA;

        return {
            canStart: status === SessionStatus.AGENDADA,
            canEnd: active,
            canCancel:
                status === SessionStatus.AGENDADA ||
                status === SessionStatus.EM_ANDAMENTO,
            canManageAgenda: active,
            canRegisterPresence: !terminal,
        };
    }

    assertCanManageAgenda(status: SessionStatus) {
        if (status !== SessionStatus.EM_ANDAMENTO) {
            throw new Error(
                'Itens só podem ser incluídos na pauta quando a sessão está EM_ANDAMENTO',
            );
        }
    }

    assertNotTerminal(status: SessionStatus) {
        if (
            status === SessionStatus.ENCERRADA ||
            status === SessionStatus.CANCELADA
        ) {
            throw new Error(
                'Sessão encerrada ou cancelada não permite alterações',
            );
        }
    }

    buildInitialLifecycleEntry(
        status: SessionStatus = SessionStatus.AGENDADA,
    ): SessionLifecycleEntry {
        return {
            status,
            observacao: 'Cadastro da sessão',
            em: new Date().toISOString(),
        };
    }

    appendLifecycleEntry(
        history: SessionLifecycleEntry[],
        entry: SessionLifecycleEntry,
    ): SessionLifecycleEntry[] {
        return [...history, entry];
    }

    getLifecycleService() {
        return this.lifecycle;
    }

    isKnownSessionType(codigo: string | null | undefined): codigo is SessionType {
        return (
            codigo !== null &&
            codigo !== undefined &&
            Object.values(SessionType).includes(codigo as SessionType)
        );
    }
}
