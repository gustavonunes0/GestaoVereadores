import { ResultadoPauta, ResultadoVotacao } from '@prisma/client';
import {
    VOTE_RESULT_LABELS,
    VoteResult,
} from '../../domain/enums/vote-result.enum';

export type ResultadoVotacaoCalculado = {
    votosSim: number;
    votosNao: number;
    abstencoes: number;
    resultado: ResultadoVotacao;
    resultadoPauta: ResultadoPauta | null;
    calculadoAutomaticamente: boolean;
    atualizaPauta: boolean;
    atualizaMateria: boolean;
};

export class ResultadoVotacaoViewModel {
    static toHttp(data: ResultadoVotacaoCalculado & { preview?: boolean }) {
        const resultado = data.resultado as VoteResult;
        const resultadoPauta = data.resultadoPauta as VoteResult | null;

        return {
            preview: data.preview ?? false,
            totais: {
                votosSim: data.votosSim,
                votosNao: data.votosNao,
                abstencoes: data.abstencoes,
            },
            resultado: {
                value: data.resultado,
                label: VOTE_RESULT_LABELS[resultado],
            },
            resultadoPauta: data.resultadoPauta
                ? {
                      value: data.resultadoPauta,
                      label: data.resultadoPauta,
                  }
                : null,
            calculadoAutomaticamente: data.calculadoAutomaticamente,
            efeitos: {
                atualizaPauta: data.atualizaPauta,
                atualizaMateria: data.atualizaMateria,
            },
        };
    }
}
