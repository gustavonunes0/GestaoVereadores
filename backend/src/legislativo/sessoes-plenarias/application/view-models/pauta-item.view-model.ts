import { FasePauta, ResultadoPauta, StatusMateria } from '@prisma/client';
import {
    AGENDA_PHASE_LABELS,
    AgendaPhase,
} from '../../domain/enums/agenda-phase.enum';

export type PautaItemPrismaPayload = {
    id: string;
    sessaoId: string;
    materiaId: string;
    ordem: number;
    fase: FasePauta;
    resultado: ResultadoPauta | null;
    isRemoved: boolean;
    createdAt: Date;
    updatedAt: Date;
    materia?: {
        id: string;
        ementa: string;
        numero: number | null;
        status: StatusMateria;
        tipo?: { id: string; nome: string } | null;
        ano?: { id: string; valor: number } | null;
    } | null;
    votacao?: {
        id: string;
        tipoVotacao: string;
        resultado: string | null;
        realizadaAt: Date | null;
    } | null;
};

export class PautaItemViewModel {
    static toHttp(data: PautaItemPrismaPayload) {
        const fase = data.fase as AgendaPhase;
        return {
            id: data.id,
            sessaoId: data.sessaoId,
            ordem: data.ordem,
            fase: {
                value: data.fase,
                label: AGENDA_PHASE_LABELS[fase] ?? data.fase,
            },
            resultado: data.resultado,
            materia: data.materia
                ? {
                      id: data.materia.id,
                      ementa: data.materia.ementa,
                      numero: data.materia.numero,
                      status: data.materia.status,
                      tipo: data.materia.tipo ?? null,
                      ano: data.materia.ano ?? null,
                  }
                : { id: data.materiaId },
            votacao: data.votacao
                ? {
                      id: data.votacao.id,
                      tipoVotacao: data.votacao.tipoVotacao,
                      resultado: data.votacao.resultado,
                      finalizada: data.votacao.realizadaAt !== null,
                  }
                : null,
            podeVotar: !data.isRemoved,
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString(),
        };
    }
}
