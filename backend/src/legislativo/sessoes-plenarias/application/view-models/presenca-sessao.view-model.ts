import { SituacaoPresenca } from '@prisma/client';
import {
    ATTENDANCE_STATUS_LABELS,
    AttendanceStatus,
} from '../../domain/enums/attendance-status.enum';
import { contaPresencaParaQuorum } from '../../domain/services/presenca-workflow';

export type PresencaSessaoPrismaPayload = {
    id: string;
    sessaoId: string;
    parlamentarId: string | null;
    parliamentarianId: string | null;
    presente: boolean;
    situacao: SituacaoPresenca;
    justificativa: string | null;
    autoRegistrado: boolean;
    registradoEm: Date | null;
    createdAt: Date;
    parliamentarian?: {
        id: string;
        parliamentaryName: string;
        photoUrl?: string | null;
    } | null;
};

export class PresencaSessaoViewModel {
    static toHttp(data: PresencaSessaoPrismaPayload) {
        const situacao = data.situacao as AttendanceStatus;
        const nome =
            data.parliamentarian?.parliamentaryName ?? null;
        return {
            id: data.id,
            sessaoId: data.sessaoId,
            parlamentarId: data.parlamentarId,
            parliamentarianId: data.parliamentarianId,
            parliamentarian: data.parliamentarian
                ? {
                      id: data.parliamentarian.id,
                      parliamentaryName: data.parliamentarian.parliamentaryName,
                      photoUrl: data.parliamentarian.photoUrl ?? null,
                  }
                : null,
            autoRegistrado: data.autoRegistrado,
            registradoEm: data.registradoEm?.toISOString() ?? null,
            // Shape legado mantido para clientes antigos — nome vem de Parliamentarian
            parlamentar: data.parliamentarian
                ? {
                      id: data.parliamentarian.id,
                      nome,
                      ativo: true,
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
