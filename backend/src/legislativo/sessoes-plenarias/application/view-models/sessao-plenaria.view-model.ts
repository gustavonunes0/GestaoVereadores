import { CodigoSituacaoSessao, CodigoTipoSessao } from '@prisma/client';
import {
    SESSION_STATUS_LABELS,
    SessionStatus,
} from '../../domain/enums/session-status.enum';
import {
    SESSION_TYPE_LABELS,
    SessionType,
} from '../../domain/enums/session-type.enum';
import {
    getSessionWorkflowCapabilities,
    resolveSessionStatus,
} from '../../domain/services/sessao-workflow';
import { SessionLifecycleEntry } from '../../domain/types/session-workflow.types';

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

export class SessaoPlenariaViewModel {
    static toHttp(data: SessaoPlenariaPrismaPayload) {
        const status = resolveSessionStatus(data.situacao);
        const capabilities = getSessionWorkflowCapabilities(data.situacao);
        const cicloVida = parseLifecycleHistory(data.cicloVidaJson);

        return {
            id: data.id,
            tenantId: data.tenantId,
            dataInicio: data.dataInicio.toISOString(),
            dataFim: data.dataFim?.toISOString() ?? null,
            mensagem: data.mensagem,
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
                codigo: data.situacao.codigo,
                label: status
                    ? SESSION_STATUS_LABELS[status]
                    : data.situacao.nome,
            },
            sessaoLegislativa: data.sessaoLegislativa
                ? {
                      id: data.sessaoLegislativa.id,
                      numero: data.sessaoLegislativa.numero,
                      legislatura: data.sessaoLegislativa.legislatura ?? null,
                  }
                : null,
            workflow: {
                status: status
                    ? {
                          value: status,
                          label: SESSION_STATUS_LABELS[status],
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
