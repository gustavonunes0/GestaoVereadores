import { TipoQuorum } from '../enums/tipo-quorum.enum';

export enum TipoVotacaoEnum {
    NOMINAL = 'NOMINAL',
    SIMBOLICA = 'SIMBOLICA',
    SECRETA = 'SECRETA',
}

export enum ResultadoVotacaoEnum {
    APROVADO = 'APROVADO',
    REJEITADO = 'REJEITADO',
    EMPATADO = 'EMPATADO',
}

export class VotacaoEntity {
    id: string;
    pautaItemId: string;
    tipoVotacao: TipoVotacaoEnum;
    exigePresenca: boolean;
    votosSim: number;
    votosNao: number;
    abstencoes: number;
    resultado: ResultadoVotacaoEnum | null;
    realizadaAt: Date | null;
    encerradaAt: Date | null;
    responsavelId: string | null;
    quorumVotacao: number | null;
    motivoEmpate: string | null;
    observacoes: string | null;
    tipoQuorum: TipoQuorum | null;
    totalMembros: number | null;
    votoQualidade: boolean;
    presidenteId: string | null;
    createdAt: Date;

    estaEncerrada(): boolean {
        return this.encerradaAt !== null;
    }

    aceitaVotosIndividuais(): boolean {
        return this.tipoVotacao !== TipoVotacaoEnum.SIMBOLICA;
    }

    estaSecreta(): boolean {
        return this.tipoVotacao === TipoVotacaoEnum.SECRETA;
    }
}
