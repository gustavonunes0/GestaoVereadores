import { BadRequestException } from '@nestjs/common';
import { StatusMateria } from '@prisma/client';

/** Mantém `emTramitacao` alinhado ao enum durante a transição do modelo legado. */
export function syncEmTramitacaoFromStatus(status: StatusMateria): boolean {
  return status === StatusMateria.EM_TRAMITACAO;
}

export function assertMateriaPodeEntrarNaPauta(materia: { status: StatusMateria }) {
  if (materia.status !== StatusMateria.EM_TRAMITACAO) {
    throw new BadRequestException(
      'Somente matérias com status EM_TRAMITACAO podem entrar na pauta',
    );
  }
}

export function assertMateriaPodeGerarNorma(materia: { status: StatusMateria }) {
  if (materia.status !== StatusMateria.APROVADA) {
    throw new BadRequestException(
      'Norma jurídica só pode ser criada a partir de matéria APROVADA',
    );
  }
}

const TRANSICOES_PERMITIDAS: Record<StatusMateria, StatusMateria[]> = {
  [StatusMateria.EM_TRAMITACAO]: [
    StatusMateria.APROVADA,
    StatusMateria.REJEITADA,
    StatusMateria.ARQUIVADA,
    StatusMateria.RETIRADA,
  ],
  [StatusMateria.APROVADA]: [StatusMateria.ARQUIVADA],
  [StatusMateria.REJEITADA]: [StatusMateria.ARQUIVADA],
  [StatusMateria.ARQUIVADA]: [],
  [StatusMateria.RETIRADA]: [StatusMateria.EM_TRAMITACAO],
};

export function assertTransicaoStatusPermitida(
  statusAtual: StatusMateria,
  novoStatus: StatusMateria,
) {
  if (statusAtual === novoStatus) return;

  const permitidos = TRANSICOES_PERMITIDAS[statusAtual];
  if (!permitidos.includes(novoStatus)) {
    throw new BadRequestException(
      `Transição de status inválida: ${statusAtual} → ${novoStatus}`,
    );
  }
}

export function mapResultadoPautaParaStatus(
  resultado: 'APROVADO' | 'REJEITADO',
): StatusMateria {
  return resultado === 'APROVADO'
    ? StatusMateria.APROVADA
    : StatusMateria.REJEITADA;
}

export function mapResultadoVotacaoParaStatus(
  resultado: 'APROVADO' | 'REJEITADO',
): StatusMateria {
  return mapResultadoPautaParaStatus(resultado);
}
