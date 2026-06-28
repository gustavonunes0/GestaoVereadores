import { MatterStatus } from '../enums/matter-status.enum';
import {
    MatterTramitationEntry,
    MatterWorkflowCapabilities,
} from '../types/matter-workflow.types';
import { MatterTramitationDomainService } from './matter-tramitation-domain.service';

const tramitationService = new MatterTramitationDomainService();

/**
 * Regras base da proposição legislativa (task 19) + tramitação (task 21).
 */
export class LegislativeMatterDomainService {
    private readonly tramitation = new MatterTramitationDomainService();

    assertTenantIdProvided(tenantId?: string) {
        if (!tenantId?.trim()) {
            throw new Error('Tenant é obrigatório para matéria legislativa');
        }
    }

    assertEmentaProvided(ementa?: string) {
        if (!ementa?.trim() || ementa.trim().length < 3) {
            throw new Error('Ementa da matéria é obrigatória');
        }
    }

    getDefaultStatus(): MatterStatus {
        return MatterStatus.DRAFT;
    }

    getAllowedTransitions(status: MatterStatus): MatterStatus[] {
        const actions = this.tramitation.getAvailableActions(status);
        const targets = actions.map((action) =>
            this.tramitation.resolveTransition(status, action),
        );
        return [...new Set(targets)];
    }

    getAllStatusTransitions() {
        return this.tramitation.getAllActionRules().map((rule) => ({
            from: rule.from,
            to: rule.to,
            action: rule.action,
        }));
    }

    /** @deprecated Preferir tramitação por ação explícita. */
    assertTransitionAllowed(
        currentStatus: MatterStatus,
        nextStatus: MatterStatus,
    ) {
        const allowed = this.getAllowedTransitions(currentStatus);
        if (currentStatus !== nextStatus && !allowed.includes(nextStatus)) {
            throw new Error(
                `Transição de status inválida: ${currentStatus} → ${nextStatus}`,
            );
        }
    }

    getWorkflowCapabilities(status: MatterStatus): MatterWorkflowCapabilities {
        const active =
            status === MatterStatus.EM_TRAMITACAO ||
            status === MatterStatus.EM_PAUTA ||
            status === MatterStatus.EM_VOTACAO;
        return {
            canTramitate:
                status === MatterStatus.EM_TRAMITACAO ||
                status === MatterStatus.PROTOCOLADA,
            canEnterAgenda: status === MatterStatus.EM_TRAMITACAO,
            canBeVoted: active,
            canGenerateNorm: status === MatterStatus.APROVADA,
        };
    }

    assertCanEnterAgenda(status: MatterStatus) {
        if (status !== MatterStatus.EM_TRAMITACAO) {
            throw new Error(
                'Somente matérias com status EM_TRAMITACAO podem entrar na pauta',
            );
        }
    }

    assertCanGenerateNorm(status: MatterStatus) {
        if (status !== MatterStatus.APROVADA) {
            throw new Error(
                'Norma jurídica só pode ser criada a partir de matéria APROVADA',
            );
        }
    }

    mapVoteResultToStatus(result: 'APROVADO' | 'REJEITADO'): MatterStatus {
        return result === 'APROVADO'
            ? MatterStatus.APROVADA
            : MatterStatus.REJEITADA;
    }

    buildInitialTramitationEntry(
        status: MatterStatus = MatterStatus.DRAFT,
    ): MatterTramitationEntry {
        return {
            status,
            observacao: 'Cadastro da matéria',
            em: new Date().toISOString(),
        };
    }

    appendTramitationEntry(
        history: MatterTramitationEntry[],
        entry: MatterTramitationEntry,
    ): MatterTramitationEntry[] {
        return [...history, entry];
    }

    syncEmTramitacaoFlag(status: MatterStatus): boolean {
        return (
            status === MatterStatus.EM_TRAMITACAO ||
            status === MatterStatus.EM_PAUTA ||
            status === MatterStatus.EM_VOTACAO
        );
    }

    getTramitationService() {
        return tramitationService;
    }
}
