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
    parliamentarian?: {
        id: string;
        parliamentaryName: string;
        status?: string;
    } | null;
};

export class VotoParlamentarViewModel {
    static toHttp(data: VotoParlamentarPrismaPayload) {
        const voto = data.voto as VoteValue;

        return {
            id: data.id,
            votacaoId: data.votacaoId,
            parlamentarId: data.parlamentarId,
            parliamentarianId: data.parliamentarianId,
            parlamentar: null,
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
