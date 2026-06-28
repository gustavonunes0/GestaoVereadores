import { BadRequestException, ConflictException } from '@nestjs/common';
import { SessionAgendaDomainService } from './session-agenda-domain.service';
import { PautaAggregateDomainService } from './pauta-aggregate-domain.service';
import { StatusPautaItem } from '../enums/status-pauta-item.enum';

const agendaService = new SessionAgendaDomainService();
const pautaAggregateService = new PautaAggregateDomainService();

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

function rethrowBadRequest(error: unknown) {
    if (error instanceof Error) {
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

export function assertPautaPodeSerPublicada(
    pauta: { status: StatusPautaItem; totalItens: number } | null | undefined,
) {
    try {
        pautaAggregateService.assertPodePublicar(pauta ?? undefined);
    } catch (error) {
        rethrowBadRequest(error);
    }
}

export function assertPautaPodeReceberItens(
    pauta: { status: StatusPautaItem } | null | undefined,
) {
    try {
        pautaAggregateService.assertPodeReceberItens(pauta ?? undefined);
    } catch (error) {
        rethrowBadRequest(error);
    }
}

export function assertMateriaSemPautaAtivaEmOutraSessao(
    materiaId: string,
    sessaoAtualId: string,
    conflito?: { sessaoId: string; materiaId: string | null } | null,
) {
    try {
        pautaAggregateService.assertMateriaSemPautaAtivaEmOutraSessao(
            materiaId,
            sessaoAtualId,
            conflito,
        );
    } catch (error) {
        rethrow(error, ConflictException);
    }
}
