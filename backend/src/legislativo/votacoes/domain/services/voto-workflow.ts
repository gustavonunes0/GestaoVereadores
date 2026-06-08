import { BadRequestException, ConflictException } from '@nestjs/common';
import { IndividualVoteDomainService } from './individual-vote-domain.service';

const voteService = new IndividualVoteDomainService();

function rethrow(error: unknown, useConflict = false): never {
    if (error instanceof Error) {
        if (useConflict) throw new ConflictException(error.message);
        throw new BadRequestException(error.message);
    }
    throw error;
}

export function assertVotoNaoDuplicado(alreadyRegistered: boolean) {
    try {
        voteService.assertNoDuplicateVote(alreadyRegistered);
    } catch (error) {
        rethrow(error, true);
    }
}

export function assertPresencaQuandoExigida(
    exigePresenca: boolean,
    estaPresente: boolean,
) {
    try {
        voteService.assertPresenceWhenRequired(exigePresenca, estaPresente);
    } catch (error) {
        rethrow(error);
    }
}

export function parlamentarPresenteParaVotar(
    presenca: { presente: boolean; situacao: string } | null,
    countsForQuorum: (situacao: string, presente: boolean) => boolean,
): boolean {
    return voteService.isPresentForVoting(presenca, countsForQuorum);
}
