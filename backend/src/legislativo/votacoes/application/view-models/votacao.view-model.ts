import {
    ResultadoVotacao,
    TipoVotacao,
    Voto,
} from '@prisma/client';
import {
    VOTE_RESULT_LABELS,
    VoteResult,
} from '../../domain/enums/vote-result.enum';
import {
    VOTE_TYPE_LABELS,
    VoteType,
} from '../../domain/enums/vote-type.enum';
import { VotingDomainService } from '../../domain/services/voting-domain.service';
import { VotoParlamentarViewModel } from './voto-parlamentar.view-model';

const votingService = new VotingDomainService();

export type VotoParlamentarPayload = {
    id: string;
    parlamentarId: string;
    voto: Voto;
    parlamentar?: {
        id: string;
        pessoa?: {
            nome?: string | null;
            nomeParlamentar?: string | null;
        } | null;
    } | null;
};

export type VotacaoPrismaPayload = {
    id: string;
    pautaItemId: string;
    tipoVotacao: TipoVotacao;
    exigePresenca: boolean;
    votosSim: number;
    votosNao: number;
    abstencoes: number;
    resultado: ResultadoVotacao | null;
    realizadaAt: Date | null;
    createdAt: Date;
    votos?: Array<
        VotoParlamentarPayload & {
            votacaoId?: string;
            parlamentar?: VotoParlamentarPayload['parlamentar'] & {
                ativo?: boolean;
            };
        }
    >;
};

export class VotacaoViewModel {
    static toHttp(data: VotacaoPrismaPayload) {
        const tipo = data.tipoVotacao as VoteType;
        const aberta = !data.realizadaAt;
        const resultado = data.resultado as VoteResult | null;

        return {
            id: data.id,
            pautaItemId: data.pautaItemId,
            tipo: {
                value: data.tipoVotacao,
                label: VOTE_TYPE_LABELS[tipo],
            },
            totais: {
                votosSim: data.votosSim,
                votosNao: data.votosNao,
                abstencoes: data.abstencoes,
            },
            resultado: resultado
                ? {
                      value: data.resultado,
                      label: VOTE_RESULT_LABELS[resultado],
                  }
                : null,
            aberta,
            finalizadaEm: data.realizadaAt?.toISOString() ?? null,
            aceitaVotoIndividual: votingService.acceptsIndividualVotes(
                data.tipoVotacao,
            ),
            ocultaVotosIndividuais: votingService.hidesIndividualVotes(
                data.tipoVotacao,
            ),
            exigePresenca: data.exigePresenca,
            votos: votingService.hidesIndividualVotes(data.tipoVotacao)
                ? undefined
                : data.votos?.map((item) =>
                      VotoParlamentarViewModel.toHttp({
                          id: item.id,
                          votacaoId: item.votacaoId ?? data.id,
                          parlamentarId: item.parlamentarId,
                          voto: item.voto,
                          parlamentar: item.parlamentar
                              ? {
                                    id: item.parlamentar.id,
                                    ativo: item.parlamentar.ativo ?? true,
                                    pessoa: item.parlamentar.pessoa,
                                }
                              : null,
                      }),
                  ),
            createdAt: data.createdAt.toISOString(),
        };
    }
}
