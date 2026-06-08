import { BadRequestException } from '@nestjs/common';
import { CodigoSituacaoSessao } from '@prisma/client';
import { SessionStatus } from '../enums/session-status.enum';
import { PlenarySessionDomainService } from './plenary-session-domain.service';

const domainService = new PlenarySessionDomainService();

type SituacaoRef = {
    codigo: CodigoSituacaoSessao | null;
    nome: string;
};

function toSessionStatus(codigo: CodigoSituacaoSessao | null): SessionStatus | null {
    if (!codigo) return null;
    return codigo as SessionStatus;
}

export function resolveCodigoSituacao(
    situacao: SituacaoRef,
): CodigoSituacaoSessao | null {
    if (situacao.codigo) return situacao.codigo;

    const nome = situacao.nome.toLowerCase();
    if (nome.includes('agendad')) return CodigoSituacaoSessao.AGENDADA;
    if (nome.includes('andamento')) return CodigoSituacaoSessao.EM_ANDAMENTO;
    if (nome.includes('encerrad')) return CodigoSituacaoSessao.ENCERRADA;
    if (nome.includes('cancelad')) return CodigoSituacaoSessao.CANCELADA;
    return null;
}

export function resolveSessionStatus(situacao: SituacaoRef): SessionStatus | null {
    return toSessionStatus(resolveCodigoSituacao(situacao));
}

function rethrowAsBadRequest(error: unknown): never {
    if (error instanceof Error) {
        throw new BadRequestException(error.message);
    }
    throw error;
}

export function assertSessaoAceitaPauta(situacao: SituacaoRef) {
    const status = resolveSessionStatus(situacao);
    if (!status) {
        throw new BadRequestException('Situação da sessão não reconhecida');
    }
    try {
        domainService.assertCanManageAgenda(status);
    } catch (error) {
        rethrowAsBadRequest(error);
    }
}

export function assertSessaoNaoEncerrada(situacao: SituacaoRef) {
    const status = resolveSessionStatus(situacao);
    if (!status) return;
    try {
        domainService.assertNotTerminal(status);
    } catch (error) {
        rethrowAsBadRequest(error);
    }
}

export function getSessionWorkflowCapabilities(situacao: SituacaoRef) {
    const status = resolveSessionStatus(situacao);
    if (!status) {
        return domainService.getWorkflowCapabilities(SessionStatus.AGENDADA);
    }
    return domainService.getWorkflowCapabilities(status);
}
