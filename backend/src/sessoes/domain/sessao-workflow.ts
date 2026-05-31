import { BadRequestException } from '@nestjs/common';
import { CodigoSituacaoSessao } from '@prisma/client';

type SituacaoRef = {
  codigo: CodigoSituacaoSessao | null;
  nome: string;
};

export function resolveCodigoSituacao(situacao: SituacaoRef): CodigoSituacaoSessao | null {
  if (situacao.codigo) return situacao.codigo;

  const nome = situacao.nome.toLowerCase();
  if (nome.includes('agendad')) return CodigoSituacaoSessao.AGENDADA;
  if (nome.includes('andamento')) return CodigoSituacaoSessao.EM_ANDAMENTO;
  if (nome.includes('encerrad')) return CodigoSituacaoSessao.ENCERRADA;
  if (nome.includes('cancelad')) return CodigoSituacaoSessao.CANCELADA;
  return null;
}

export function assertSessaoAceitaPauta(situacao: SituacaoRef) {
  const codigo = resolveCodigoSituacao(situacao);
  if (codigo !== CodigoSituacaoSessao.EM_ANDAMENTO) {
    throw new BadRequestException(
      'Itens só podem ser incluídos na pauta quando a sessão está EM_ANDAMENTO',
    );
  }
}

export function assertSessaoNaoEncerrada(situacao: SituacaoRef) {
  const codigo = resolveCodigoSituacao(situacao);
  if (
    codigo === CodigoSituacaoSessao.ENCERRADA ||
    codigo === CodigoSituacaoSessao.CANCELADA
  ) {
    throw new BadRequestException('Sessão encerrada ou cancelada não permite alterações');
  }
}
