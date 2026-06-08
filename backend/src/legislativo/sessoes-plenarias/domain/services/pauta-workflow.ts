import { BadRequestException, ConflictException } from '@nestjs/common';
import { SessionAgendaDomainService } from './session-agenda-domain.service';

const agendaService = new SessionAgendaDomainService();

function rethrow(error: unknown, ConflictType: typeof ConflictException) {
    if (error instanceof Error) {
        if (
            error.message.includes('já consta') ||
            error.message.includes('já está em uso')
        ) {
            throw new ConflictType(error.message);
        }
        throw new BadRequestException(error.message);
    }
    throw error;
}

export function assertOrdemDisponivelNaPauta(
    ordem: number,
    items: Parameters<SessionAgendaDomainService['assertOrderAvailable']>[1],
    ignoreItemId?: string,
) {
    try {
        agendaService.assertOrderAvailable(ordem, items, ignoreItemId);
    } catch (error) {
        rethrow(error, ConflictException);
    }
}

export function assertMateriaNaoDuplicadaNaPauta(
    materiaId: string,
    items: Parameters<SessionAgendaDomainService['assertMatterNotInAgenda']>[1],
) {
    try {
        agendaService.assertMatterNotInAgenda(materiaId, items);
    } catch (error) {
        rethrow(error, ConflictException);
    }
}

export function assertMateriaNaPautaParaVotacao(
    item: { isRemoved?: boolean } | null | undefined,
) {
    try {
        agendaService.assertItemOnAgenda(item);
    } catch (error) {
        throw new BadRequestException(
            error instanceof Error ? error.message : 'Item de pauta inválido',
        );
    }
}

export function assertPodeRemoverItemPauta(hasOpenVotacao: boolean) {
    try {
        agendaService.assertCanRemoveItem(hasOpenVotacao);
    } catch (error) {
        throw new BadRequestException(
            error instanceof Error ? error.message : 'Remoção não permitida',
        );
    }
}

export function getDefaultFasePauta() {
    return agendaService.getDefaultPhase();
}
