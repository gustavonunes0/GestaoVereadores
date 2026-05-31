import { BadRequestException } from '@nestjs/common';
import {
  ResultadoPauta,
  ResultadoVotacao,
  TipoVotacao,
  Voto,
} from '@prisma/client';

export const QUORUM_MINIMO_PERCENTUAL = 0.5;

export function assertQuorumAtingido(
  presentes: number,
  totalParlamentares: number,
  requerQuorum: boolean,
) {
  if (!requerQuorum) return;

  if (totalParlamentares === 0) {
    throw new BadRequestException(
      'Não há parlamentares ativos cadastrados para calcular quorum',
    );
  }

  const percentual = presentes / totalParlamentares;
  if (percentual < QUORUM_MINIMO_PERCENTUAL) {
    throw new BadRequestException(
      `Quorum não atingido: ${presentes} de ${totalParlamentares} parlamentares presentes (${Math.round(percentual * 100)}%, mínimo ${QUORUM_MINIMO_PERCENTUAL * 100}%)`,
    );
  }
}

export function contarVotos(votos: Voto[]) {
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

export function calcularResultadoVotacao(
  votosSim: number,
  votosNao: number,
): ResultadoVotacao {
  if (votosSim > votosNao) return ResultadoVotacao.APROVADO;
  if (votosNao > votosSim) return ResultadoVotacao.REJEITADO;
  return ResultadoVotacao.EMPATADO;
}

export function mapResultadoVotacaoParaPauta(
  resultado: ResultadoVotacao,
): ResultadoPauta | null {
  if (resultado === ResultadoVotacao.APROVADO) return ResultadoPauta.APROVADO;
  if (resultado === ResultadoVotacao.REJEITADO) return ResultadoPauta.REJEITADO;
  return null;
}

export function assertTipoAceitaVotoIndividual(tipo: TipoVotacao) {
  if (tipo === TipoVotacao.SIMBOLICA) {
    throw new BadRequestException(
      'Votação simbólica não registra voto por parlamentar; finalize com totais',
    );
  }
}

export function assertVotacaoAberta(realizadaAt: Date | null) {
  if (realizadaAt) {
    throw new BadRequestException('Votação já foi finalizada');
  }
}
