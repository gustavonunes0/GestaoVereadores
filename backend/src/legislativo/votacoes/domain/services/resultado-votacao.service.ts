import { ResultadoVotacaoEnum } from '../entities/votacao.entity';
import { TipoQuorum } from '../enums/tipo-quorum.enum';

export class ResultadoVotacaoService {
    determinar(params: {
        sim: number;
        nao: number;
        totalMembros: number;
        tipoQuorum: TipoQuorum;
    }): ResultadoVotacaoEnum {
        const { sim, nao, totalMembros, tipoQuorum } = params;

        switch (tipoQuorum) {
            case TipoQuorum.MAIORIA_SIMPLES:
                if (sim > nao) return ResultadoVotacaoEnum.APROVADO;
                if (nao > sim) return ResultadoVotacaoEnum.REJEITADO;
                return ResultadoVotacaoEnum.EMPATADO;

            case TipoQuorum.MAIORIA_ABSOLUTA: {
                const minimoAbsoluto = Math.floor(totalMembros / 2) + 1;
                if (sim >= minimoAbsoluto) return ResultadoVotacaoEnum.APROVADO;
                return ResultadoVotacaoEnum.REJEITADO;
            }

            case TipoQuorum.QUALIFICADO_DOIS_TERCOS: {
                const minimoDoisTercos = Math.ceil((totalMembros * 2) / 3);
                if (sim >= minimoDoisTercos) return ResultadoVotacaoEnum.APROVADO;
                return ResultadoVotacaoEnum.REJEITADO;
            }

            case TipoQuorum.QUALIFICADO_TRES_QUINTOS: {
                const minimoTresQuintos = Math.ceil((totalMembros * 3) / 5);
                if (sim >= minimoTresQuintos) return ResultadoVotacaoEnum.APROVADO;
                return ResultadoVotacaoEnum.REJEITADO;
            }

            default:
                throw new Error(`Tipo de quórum desconhecido: ${tipoQuorum}`);
        }
    }
}
