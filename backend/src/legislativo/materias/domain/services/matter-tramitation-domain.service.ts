import { MatterTramitationAction } from '../enums/matter-tramitation-action.enum';
import { MatterStatus } from '../enums/matter-status.enum';

type ActionRule = {
    from: MatterStatus[];
    to: MatterStatus;
    defaultObservacao: string;
};

const ACTION_RULES: Record<MatterTramitationAction, ActionRule> = {
    [MatterTramitationAction.PROTOCOLAR]: {
        from: [MatterStatus.DRAFT],
        to: MatterStatus.PROTOCOLADA,
        defaultObservacao: 'Matéria protocolada',
    },
    [MatterTramitationAction.INICIAR_TRAMITACAO]: {
        from: [MatterStatus.PROTOCOLADA],
        to: MatterStatus.EM_TRAMITACAO,
        defaultObservacao: 'Tramitação iniciada',
    },
    [MatterTramitationAction.COLOCAR_EM_PAUTA]: {
        from: [MatterStatus.EM_TRAMITACAO],
        to: MatterStatus.EM_PAUTA,
        defaultObservacao: 'Matéria incluída em pauta',
    },
    [MatterTramitationAction.INICIAR_VOTACAO]: {
        from: [MatterStatus.EM_PAUTA],
        to: MatterStatus.EM_VOTACAO,
        defaultObservacao: 'Votação aberta na sessão plenária',
    },
    [MatterTramitationAction.RETIRAR_DA_PAUTA]: {
        from: [MatterStatus.EM_PAUTA],
        to: MatterStatus.EM_TRAMITACAO,
        defaultObservacao: 'Matéria retirada da pauta',
    },
    [MatterTramitationAction.APROVAR]: {
        from: [
            MatterStatus.EM_TRAMITACAO,
            MatterStatus.EM_PAUTA,
            MatterStatus.EM_VOTACAO,
        ],
        to: MatterStatus.APROVADA,
        defaultObservacao: 'Matéria aprovada',
    },
    [MatterTramitationAction.REJEITAR]: {
        from: [
            MatterStatus.EM_TRAMITACAO,
            MatterStatus.EM_PAUTA,
            MatterStatus.EM_VOTACAO,
        ],
        to: MatterStatus.REJEITADA,
        defaultObservacao: 'Matéria rejeitada',
    },
    [MatterTramitationAction.ARQUIVAR]: {
        from: [
            MatterStatus.DRAFT,
            MatterStatus.PROTOCOLADA,
            MatterStatus.EM_TRAMITACAO,
            MatterStatus.EM_PAUTA,
            MatterStatus.APROVADA,
            MatterStatus.REJEITADA,
            MatterStatus.RETIRADA,
        ],
        to: MatterStatus.ARQUIVADA,
        defaultObservacao: 'Matéria arquivada',
    },
    [MatterTramitationAction.RETIRAR]: {
        from: [MatterStatus.EM_TRAMITACAO, MatterStatus.EM_PAUTA],
        to: MatterStatus.RETIRADA,
        defaultObservacao: 'Matéria retirada pelo autor',
    },
    [MatterTramitationAction.REINICIAR_TRAMITACAO]: {
        from: [MatterStatus.RETIRADA],
        to: MatterStatus.EM_TRAMITACAO,
        defaultObservacao: 'Tramitação reiniciada',
    },
    [MatterTramitationAction.TRANSFORMAR_EM_NORMA]: {
        from: [MatterStatus.APROVADA],
        to: MatterStatus.TRANSFORMADA_EM_NORMA,
        defaultObservacao: 'Matéria transformada em norma jurídica',
    },
};

/**
 * Tramitação básica — status só muda por ações explícitas (task 21).
 */
export class MatterTramitationDomainService {
    resolveTransition(
        currentStatus: MatterStatus,
        action: MatterTramitationAction,
    ): MatterStatus {
        const rule = ACTION_RULES[action];
        if (!rule.from.includes(currentStatus)) {
            throw new Error(
                `Ação ${action} não permitida no status ${currentStatus}`,
            );
        }
        return rule.to;
    }

    getAvailableActions(currentStatus: MatterStatus): MatterTramitationAction[] {
        return (
            Object.entries(ACTION_RULES) as [
                MatterTramitationAction,
                ActionRule,
            ][]
        )
            .filter(([, rule]) => rule.from.includes(currentStatus))
            .map(([action]) => action);
    }

    getDefaultObservacao(action: MatterTramitationAction): string {
        return ACTION_RULES[action].defaultObservacao;
    }

    getAllActionRules() {
        return Object.entries(ACTION_RULES).map(([action, rule]) => ({
            action: action as MatterTramitationAction,
            from: rule.from,
            to: rule.to,
        }));
    }
}
