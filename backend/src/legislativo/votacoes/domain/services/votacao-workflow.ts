import { BadRequestException, ConflictException } from '@nestjs/common';
import {
    ResultadoPauta,
    ResultadoVotacao,
    TipoVotacao,
    Voto,
} from '@prisma/client';
import { VotingDomainService, QUORUM_MINIMO_PERCENTUAL } from './voting-domain.service';

const votingService = new VotingDomainService();

export { QUORUM_MINIMO_PERCENTUAL };

function rethrow(error: unknown, useConflict = false): never {
    if (error instanceof Error) {
        if (useConflict) throw new ConflictException(error.message);
        throw new BadRequestException(error.message);
    }
    throw error;
}

export function assertQuorumAtingido(
    presentes: number,
    totalParlamentares: number,
    requerQuorum: boolean,
) {
    try {
        votingService.assertQuorumReached(
            presentes,
            totalParlamentares,
            requerQuorum,
        );
    } catch (error) {
        rethrow(error);
    }
}

export function contarVotos(votos: Voto[]) {
    return votingService.countVotes(votos);
}

export function calcularResultadoVotacao(
    votosSim: number,
    votosNao: number,
): ResultadoVotacao {
    return votingService.calculateResult(votosSim, votosNao);
}

export function mapResultadoVotacaoParaPauta(
    resultado: ResultadoVotacao,
): ResultadoPauta | null {
    return votingService.mapResultToAgendaItem(resultado);
}

export function assertTipoAceitaVotoIndividual(tipo: TipoVotacao) {
    try {
        votingService.assertIndividualVoteAllowed(tipo);
    } catch (error) {
        rethrow(error);
    }
}

export function assertVotacaoAberta(realizadaAt: Date | null) {
    try {
        votingService.assertVotingOpen(realizadaAt);
    } catch (error) {
        rethrow(error);
    }
}

export function assertVotacaoNaoExisteParaPauta(hasVoting: boolean) {
    try {
        votingService.assertNoExistingVoteForAgendaItem(hasVoting);
    } catch (error) {
        rethrow(error, true);
    }
}

export function assertTotaisSimbolica(
    tipo: TipoVotacao,
    votosSim?: number,
    votosNao?: number,
) {
    try {
        votingService.assertSymbolicTotalsProvided(tipo, votosSim, votosNao);
    } catch (error) {
        rethrow(error);
    }
}

export function assertTotaisManuaisNaoPermitidos(
    tipo: TipoVotacao,
    votosSim?: number,
    votosNao?: number,
    abstencoes?: number,
) {
    try {
        votingService.assertManualTotalsNotAllowed(
            tipo,
            votosSim,
            votosNao,
            abstencoes,
        );
    } catch (error) {
        rethrow(error);
    }
}

export function resolverTotaisFinalizacao(
    tipo: TipoVotacao,
    manualTotals: {
        votosSim?: number;
        votosNao?: number;
        abstencoes?: number;
    },
    individualVotes: Voto[],
) {
    return votingService.resolveFinalizationTotals(
        tipo,
        manualTotals,
        individualVotes,
    );
}

export function montarResultadoVotacao(
    votosSim: number,
    votosNao: number,
    abstencoes: number,
) {
    return votingService.buildResultOutcome(votosSim, votosNao, abstencoes);
}
