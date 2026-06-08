import { AgendaPhase } from '../enums/agenda-phase.enum';

export type ActiveAgendaItem = {
    id: string;
    materiaId: string;
    ordem: number;
    isRemoved?: boolean;
};

/**
 * Regras da pauta da sessão plenária (task 23).
 */
export class SessionAgendaDomainService {
    getDefaultPhase(): AgendaPhase {
        return AgendaPhase.ORDEM_DO_DIA;
    }

    assertOrderAvailable(
        ordem: number,
        items: ActiveAgendaItem[],
        ignoreItemId?: string,
    ) {
        const conflict = items.find(
            (item) =>
                item.ordem === ordem &&
                !item.isRemoved &&
                item.id !== ignoreItemId,
        );
        if (conflict) {
            throw new Error(
                `Ordem ${ordem} já está em uso na pauta desta sessão`,
            );
        }
    }

    assertMatterNotInAgenda(materiaId: string, items: ActiveAgendaItem[]) {
        const duplicate = items.find(
            (item) => item.materiaId === materiaId && !item.isRemoved,
        );
        if (duplicate) {
            throw new Error('Matéria já consta na pauta desta sessão');
        }
    }

    assertItemOnAgenda(item: { isRemoved?: boolean } | null | undefined) {
        if (!item || item.isRemoved) {
            throw new Error(
                'Matéria precisa estar na pauta da sessão antes de ser votada',
            );
        }
    }

    assertCanRemoveItem(hasOpenVotacao: boolean) {
        if (hasOpenVotacao) {
            throw new Error(
                'Não é possível remover item de pauta com votação em andamento',
            );
        }
    }
}
