import {
    CodigoSituacaoSessao,
    CodigoTipoSessao,
    FaseSessao as PrismaFaseSessao,
    StatusSessao as PrismaStatusSessao,
} from '@prisma/client';
import {
    SESSION_STATUS_LABELS,
    SessionStatus,
} from '../../domain/enums/session-status.enum';
import {
    STATUS_SESSAO_LABELS,
    StatusSessao,
    statusSessaoToCodigoSituacao,
} from '../../domain/enums/status-sessao.enum';
import {
    SESSION_TYPE_LABELS,
    SessionType,
} from '../../domain/enums/session-type.enum';
import {
    getSessionWorkflowCapabilities,
    resolveSessionStatus,
} from '../../domain/services/sessao-workflow';
import { SessionLifecycleEntry } from '../../domain/types/session-workflow.types';
import {
    FASE_SESSAO_LABELS,
    FaseSessao,
} from '../../domain/enums/fase-sessao.enum';
import {
    PautaItemPrismaPayload,
    PautaItemViewModel,
} from './pauta-item.view-model';
import {
    PresencaSessaoPrismaPayload,
    PresencaSessaoViewModel,
} from './presenca-sessao.view-model';

function parseLifecycleHistory(cicloVidaJson: unknown): SessionLifecycleEntry[] {
    if (!Array.isArray(cicloVidaJson)) return [];
    return cicloVidaJson as SessionLifecycleEntry[];
}

export type SessaoPlenariaPrismaPayload = {
    id: string;
    tenantId: string;
    dataInicio: Date;
    dataFim: Date | null;
    mensagem: string | null;
    cicloVidaJson: unknown;
    statusSessao?: PrismaStatusSessao;
    dataAbertura?: Date | null;
    dataEncerramento?: Date | null;
    dataSuspensao?: Date | null;
    quorumMinimo?: number | null;
    quorumPresente?: number | null;
    sessaoLegislativaId?: string | null;
    faseAtual?: PrismaFaseSessao;
    linkJitsi?: string | null;
    linkYoutube?: string | null;
    createdAt: Date;
    updatedAt: Date;
    tipoSessao: {
        id: string;
        nome: string;
        codigo: CodigoTipoSessao | null;
        requerQuorum: boolean;
    };
    situacao: {
        id: string;
        nome: string;
        codigo: CodigoSituacaoSessao | null;
    };
    sessaoLegislativa?: {
        id: string;
        numero: number;
        legislatura?: { id: string; numero: number } | null;
    } | null;
    pautaItens?: unknown[];
    presencas?: unknown[];
};

function mapPautaItens(items: unknown[] | undefined) {
    return (items ?? [])
        .filter((raw) => !(raw as { isRemoved?: boolean }).isRemoved)
        .map((raw) =>
            PautaItemViewModel.toHttp(raw as PautaItemPrismaPayload),
        );
}

function mapPresencas(items: unknown[] | undefined) {
    return (items ?? []).map((raw) =>
        PresencaSessaoViewModel.toHttp(raw as PresencaSessaoPrismaPayload),
    );
}

export class SessaoPlenariaViewModel {
    static toHttp(data: SessaoPlenariaPrismaPayload) {
        const statusLegado = resolveSessionStatus(data.situacao);
        const statusSessao = (data.statusSessao ??
            statusLegado) as StatusSessao | null;
        const statusWorkflow: SessionStatus | null = statusSessao
            ? (statusSessaoToCodigoSituacao(statusSessao) as SessionStatus)
            : statusLegado;
        const capabilities = statusWorkflow
            ? getSessionWorkflowCapabilities({
                  codigo: statusSessaoToCodigoSituacao(
                      statusSessao ?? StatusSessao.AGENDADA,
                  ) as SessaoPlenariaPrismaPayload['situacao']['codigo'],
                  nome: data.situacao.nome,
              })
            : getSessionWorkflowCapabilities(data.situacao);
        const cicloVida = parseLifecycleHistory(data.cicloVidaJson);

        return {
            id: data.id,
            dataInicio: data.dataInicio.toISOString(),
            dataFim: data.dataFim?.toISOString() ?? null,
            mensagem: data.mensagem,
            statusSessao,
            statusSessaoLabel: statusSessao
                ? STATUS_SESSAO_LABELS[statusSessao]
                : null,
            dataAbertura: data.dataAbertura?.toISOString() ?? null,
            dataEncerramento: data.dataEncerramento?.toISOString() ?? null,
            dataSuspensao: data.dataSuspensao?.toISOString() ?? null,
            quorumMinimo: data.quorumMinimo ?? null,
            quorumPresente: data.quorumPresente ?? null,
            sessaoLegislativaId: data.sessaoLegislativaId ?? null,
            tipo: {
                id: data.tipoSessao.id,
                nome: data.tipoSessao.nome,
                codigo: data.tipoSessao.codigo,
                label: data.tipoSessao.codigo
                    ? SESSION_TYPE_LABELS[data.tipoSessao.codigo as SessionType]
                    : data.tipoSessao.nome,
                requerQuorum: data.tipoSessao.requerQuorum,
            },
            situacao: {
                id: data.situacao.id,
                nome: data.situacao.nome,
                codigo: statusSessao
                    ? statusSessaoToCodigoSituacao(statusSessao)
                    : data.situacao.codigo,
                label: statusSessao
                    ? STATUS_SESSAO_LABELS[statusSessao]
                    : statusLegado
                      ? SESSION_STATUS_LABELS[statusLegado]
                      : data.situacao.nome,
            },
            faseAtual: data.faseAtual
                ? {
                      value: data.faseAtual,
                      label: FASE_SESSAO_LABELS[data.faseAtual as unknown as FaseSessao] ?? data.faseAtual,
                  }
                : null,
            linkJitsi: data.linkJitsi ?? null,
            linkYoutube: data.linkYoutube ?? null,
            sessaoLegislativa: data.sessaoLegislativa
                ? {
                      id: data.sessaoLegislativa.id,
                      numero: data.sessaoLegislativa.numero,
                      legislatura: data.sessaoLegislativa.legislatura ?? null,
                  }
                : null,
            pautaItens: mapPautaItens(data.pautaItens),
            presencas: mapPresencas(data.presencas),
            workflow: {
                status: statusWorkflow
                    ? {
                          value: statusWorkflow,
                          label: SESSION_STATUS_LABELS[statusWorkflow],
                      }
                    : null,
                capabilities,
                cicloVida,
            },
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString(),
        };
    }
}
