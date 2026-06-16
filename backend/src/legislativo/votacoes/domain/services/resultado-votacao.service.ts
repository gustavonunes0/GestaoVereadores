import { ResultadoVotacaoEnum } from '../entities/votacao.entity';

export class ResultadoVotacaoService {
    // TODO: Presidente da mesa tem voto de qualidade em caso de empate —
    //       requer integração com BoardMember (implementar em versão futura)
    determinar(votosSim: number, votosNao: number): ResultadoVotacaoEnum {
        if (votosSim > votosNao) return ResultadoVotacaoEnum.APROVADO;
        if (votosNao > votosSim) return ResultadoVotacaoEnum.REJEITADO;
        return ResultadoVotacaoEnum.EMPATADO;
    }
}
