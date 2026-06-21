import { FasePauta, ResultadoPauta, StatusMateria, StatusPautaItem, TipoPautaItem } from '@prisma/client';
import {
    AGENDA_PHASE_LABELS,
    AgendaPhase,
} from '../../domain/enums/agenda-phase.enum';
import {
    TIPO_PAUTA_ITEM_LABELS,
    TipoPautaItem as DomainTipoPautaItem,
} from '../../domain/enums/tipo-pauta-item.enum';

export type PautaItemPrismaPayload = {
    id: string;
    sessaoId: string;
    materiaId: string;
    ordem: number;
    fase: FasePauta;
    tipoPautaItem: TipoPautaItem;
    resultado: ResultadoPauta | null;
    statusPauta: StatusPautaItem;
    isRemoved: boolean;
    createdAt: Date;
    updatedAt: Date;
    materia?: {
        id: string;
        ementa: string;
        numero: number | null;
        status: StatusMateria;
        tipo?: { id: string; nome: string; sigla?: string | null } | null;
        ano?: { id: string; valor: number } | null;
    } | null;
    votacao?: {
        id: string;
        tipoVotacao: string;
        resultado: string | null;
        realizadaAt: Date | null;
        votosSim?: number;
        votosNao?: number;
        abstencoes?: number;
        votos?: {
            id: string;
            parlamentarId: string;
            voto: string;
            parlamentar?: {
                id: string;
                pessoa?: {
                    nome?: string | null;
                    nomeParlamentar?: string | null;
                } | null;
            } | null;
        }[];
    } | null;
};

export class PautaItemViewModel {
    static toHttp(data: PautaItemPrismaPayload) {
        const fase = data.fase as AgendaPhase;
        const tipoPautaItem = data.tipoPautaItem as unknown as DomainTipoPautaItem;
        return {
            id: data.id,
            sessaoId: data.sessaoId,
            ordem: data.ordem,
            fase: {
                value: data.fase,
                label: AGENDA_PHASE_LABELS[fase] ?? data.fase,
            },
            tipoPautaItem: {
                value: data.tipoPautaItem,
                label: TIPO_PAUTA_ITEM_LABELS[tipoPautaItem] ?? data.tipoPautaItem,
            },
            resultado: data.resultado,
            status: data.statusPauta,
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
                      realizadaAt: data.votacao.realizadaAt?.toISOString() ?? null,
                      finalizada: data.votacao.realizadaAt !== null,
                      votosSim: data.votacao.votosSim,
                      votosNao: data.votacao.votosNao,
                      abstencoes: data.votacao.abstencoes,
                      votos: data.votacao.votos?.map((v) => ({
                          id: v.id,
                          parlamentarId: v.parlamentarId,
                          voto: v.voto,
                          parlamentar: v.parlamentar
                              ? {
                                    id: v.parlamentar.id,
                                    pessoa: v.parlamentar.pessoa ?? null,
                                }
                              : null,
                      })),
                  }
                : null,
            podeVotar: !data.isRemoved,
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString(),
        };
    }
}
