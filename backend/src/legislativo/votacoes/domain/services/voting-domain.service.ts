import {
    ResultadoPauta,
    ResultadoVotacao,
    TipoVotacao,
    Voto,
} from '@prisma/client';
import { VoteType } from '../enums/vote-type.enum';

export const QUORUM_MINIMO_PERCENTUAL = 0.5;

/**
 * Regras de votação vinculada a item de pauta (task 25).
 */
export class VotingDomainService {
    assertQuorumReached(
        presentes: number,
        totalParlamentares: number,
        requerQuorum: boolean,
    ) {
        if (!requerQuorum) return;

        if (totalParlamentares === 0) {
            throw new Error(
                'Não há parlamentares ativos cadastrados para calcular quorum',
            );
        }

        const percentual = presentes / totalParlamentares;
        if (percentual < QUORUM_MINIMO_PERCENTUAL) {
            throw new Error(
                `Quorum não atingido: ${presentes} de ${totalParlamentares} parlamentares presentes (${Math.round(percentual * 100)}%, mínimo ${QUORUM_MINIMO_PERCENTUAL * 100}%)`,
            );
        }
    }

    countVotes(votos: Voto[]) {
        let votosSim = 0;
        let votosNao = 0;
        let abstencoes = 0;

        for (const v of votos) {
            if (v === Voto.SIM) votosSim += 1;
            else if (v === Voto.NAO) votosNao += 1;
            else abstencoes += 1;
        }

        return { votosSim, votosNao, abstencoes };
    }

    calculateResult(votosSim: number, votosNao: number): ResultadoVotacao {
        if (votosSim > votosNao) return ResultadoVotacao.APROVADO;
        if (votosNao > votosSim) return ResultadoVotacao.REJEITADO;
        return ResultadoVotacao.EMPATADO;
    }

    mapResultToAgendaItem(
        resultado: ResultadoVotacao,
    ): ResultadoPauta | null {
        if (resultado === ResultadoVotacao.APROVADO) {
            return ResultadoPauta.APROVADO;
        }
        if (resultado === ResultadoVotacao.REJEITADO) {
            return ResultadoPauta.REJEITADO;
        }
        if (resultado === ResultadoVotacao.EMPATADO) {
            return ResultadoPauta.ADIADO;
        }
        return null;
    }

    shouldTramitateMatter(resultado: ResultadoVotacao): boolean {
        return (
            resultado === ResultadoVotacao.APROVADO ||
            resultado === ResultadoVotacao.REJEITADO
        );
    }

    assertManualTotalsNotAllowed(
        tipo: TipoVotacao,
        votosSim?: number,
        votosNao?: number,
        abstencoes?: number,
    ) {
        if (tipo === TipoVotacao.SIMBOLICA) return;

        if (
            votosSim !== undefined ||
            votosNao !== undefined ||
            abstencoes !== undefined
        ) {
            throw new Error(
                'Votação nominal ou secreta calcula totais automaticamente; não informe votosSim, votosNao ou abstencoes manualmente',
            );
        }
    }

    resolveFinalizationTotals(
        tipo: TipoVotacao,
        manualTotals: {
            votosSim?: number;
            votosNao?: number;
            abstencoes?: number;
        },
        individualVotes: Voto[],
    ) {
        if (tipo === TipoVotacao.SIMBOLICA) {
            this.assertSymbolicTotalsProvided(
                tipo,
                manualTotals.votosSim,
                manualTotals.votosNao,
            );
            return {
                votosSim: manualTotals.votosSim!,
                votosNao: manualTotals.votosNao!,
                abstencoes: manualTotals.abstencoes ?? 0,
                calculadoAutomaticamente: false,
            };
        }

        this.assertManualTotalsNotAllowed(
            tipo,
            manualTotals.votosSim,
            manualTotals.votosNao,
            manualTotals.abstencoes,
        );

        const totais = this.countVotes(individualVotes);
        return {
            ...totais,
            calculadoAutomaticamente: true,
        };
    }

    buildResultOutcome(votosSim: number, votosNao: number, abstencoes: number) {
        const resultado = this.calculateResult(votosSim, votosNao);
        const resultadoPauta = this.mapResultToAgendaItem(resultado);

        return {
            votosSim,
            votosNao,
            abstencoes,
            resultado,
            resultadoPauta,
            atualizaMateria: this.shouldTramitateMatter(resultado),
            atualizaPauta: resultadoPauta !== null,
        };
    }

    assertIndividualVoteAllowed(tipo: TipoVotacao) {
        if (tipo === TipoVotacao.SIMBOLICA) {
            throw new Error(
                'Votação simbólica não registra voto por parlamentar; finalize com totais',
            );
        }
    }

    assertVotingOpen(realizadaAt: Date | null) {
        if (realizadaAt) {
            throw new Error('Votação já foi finalizada');
        }
    }

    assertNoExistingVoteForAgendaItem(hasVoting: boolean) {
        if (hasVoting) {
            throw new Error(
                'Já existe votação principal para este item de pauta',
            );
        }
    }

    assertSymbolicTotalsProvided(
        tipo: TipoVotacao,
        votosSim?: number,
        votosNao?: number,
    ) {
        if (tipo !== TipoVotacao.SIMBOLICA) return;
        if (votosSim === undefined || votosNao === undefined) {
            throw new Error(
                'Votação simbólica exige votosSim e votosNao na finalização',
            );
        }
    }

    acceptsIndividualVotes(tipo: TipoVotacao): boolean {
        return (tipo as VoteType) !== VoteType.SIMBOLICA;
    }

    hidesIndividualVotes(tipo: TipoVotacao): boolean {
        return (tipo as VoteType) === VoteType.SECRETA;
    }
}
