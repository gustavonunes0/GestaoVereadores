import { SituacaoPresenca } from '@prisma/client';
import {
    ATTENDANCE_STATUS_LABELS,
    AttendanceStatus,
} from '../../domain/enums/attendance-status.enum';
import { contaPresencaParaQuorum } from '../../domain/services/presenca-workflow';

export type PresencaSessaoPrismaPayload = {
    id: string;
    sessaoId: string;
    parlamentarId: string;
    presente: boolean;
    situacao: SituacaoPresenca;
    justificativa: string | null;
    createdAt: Date;
    parlamentar?: {
        id: string;
        ativo: boolean;
        pessoa?: {
            nome?: string | null;
            nomeParlamentar?: string | null;
        } | null;
    } | null;
};

export class PresencaSessaoViewModel {
    static toHttp(data: PresencaSessaoPrismaPayload) {
        const situacao = data.situacao as AttendanceStatus;
        return {
            id: data.id,
            sessaoId: data.sessaoId,
            parlamentarId: data.parlamentarId,
            parlamentar: data.parlamentar
                ? {
                      id: data.parlamentar.id,
                      nome:
                          data.parlamentar.pessoa?.nomeParlamentar ??
                          data.parlamentar.pessoa?.nome ??
                          null,
                      ativo: data.parlamentar.ativo,
                  }
                : null,
            presente: data.presente,
            situacao: {
                value: data.situacao,
                label: ATTENDANCE_STATUS_LABELS[situacao],
            },
            justificativa: data.justificativa,
            contaParaQuorum: contaPresencaParaQuorum(
                data.situacao,
                data.presente,
            ),
            createdAt: data.createdAt.toISOString(),
        };
    }
}
