import { Voto } from '@prisma/client';
import {
    VOTE_VALUE_LABELS,
    VoteValue,
} from '../../domain/enums/vote-value.enum';

export type VotoParlamentarPrismaPayload = {
    id: string;
    votacaoId: string;
    parlamentarId: string | null;
    parliamentarianId: string | null;
    voto: Voto;
    parlamentar?: {
        id: string;
        ativo: boolean;
        pessoa?: {
            nome?: string | null;
            nomeParlamentar?: string | null;
        } | null;
    } | null;
    parliamentarian?: {
        id: string;
        parliamentaryName: string;
        status?: string;
    } | null;
};

export class VotoParlamentarViewModel {
    static toHttp(data: VotoParlamentarPrismaPayload) {
        const voto = data.voto as VoteValue;
        const nomeParlamentarLegado =
            data.parlamentar?.pessoa?.nomeParlamentar ??
            data.parlamentar?.pessoa?.nome ??
            null;

        return {
            id: data.id,
            votacaoId: data.votacaoId,
            parlamentarId: data.parlamentarId,
            parliamentarianId: data.parliamentarianId,
            parlamentar: data.parlamentar
                ? {
                      id: data.parlamentar.id,
                      nome: nomeParlamentarLegado,
                      ativo: data.parlamentar.ativo,
                  }
                : null,
            parliamentarian: data.parliamentarian
                ? {
                      id: data.parliamentarian.id,
                      nome: data.parliamentarian.parliamentaryName,
                  }
                : null,
            voto: {
                value: data.voto,
                label: VOTE_VALUE_LABELS[voto],
            },
        };
    }
}
