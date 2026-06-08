import { Voto } from '@prisma/client';
import {
    VOTE_VALUE_LABELS,
    VoteValue,
} from '../../domain/enums/vote-value.enum';

export type VotoParlamentarPrismaPayload = {
    id: string;
    votacaoId: string;
    parlamentarId: string;
    voto: Voto;
    parlamentar?: {
        id: string;
        ativo: boolean;
        pessoa?: {
            nome?: string | null;
            nomeParlamentar?: string | null;
        } | null;
    } | null;
};

export class VotoParlamentarViewModel {
    static toHttp(data: VotoParlamentarPrismaPayload) {
        const voto = data.voto as VoteValue;
        return {
            id: data.id,
            votacaoId: data.votacaoId,
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
            voto: {
                value: data.voto,
                label: VOTE_VALUE_LABELS[voto],
            },
        };
    }
}
