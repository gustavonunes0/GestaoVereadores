import { StatusSessao } from '../enums/status-sessao.enum';
import { FaseSessao } from '../enums/fase-sessao.enum';

const TRANSICOES: Record<StatusSessao, StatusSessao[]> = {
    [StatusSessao.AGENDADA]:  [StatusSessao.ABERTA, StatusSessao.CANCELADA],
    [StatusSessao.ABERTA]:    [StatusSessao.SUSPENSA, StatusSessao.ENCERRADA],
    [StatusSessao.SUSPENSA]:  [StatusSessao.ABERTA, StatusSessao.ENCERRADA],
    [StatusSessao.ENCERRADA]: [],
    [StatusSessao.CANCELADA]: [],
};

export class SessaoPlenariaEntity {
    id: string;
    tenantId: string;
    tipoSessaoId: string;
    sessaoLegislativaId: string | null;
    dataInicio: Date;
    dataFim: Date | null;
    statusSessao: StatusSessao;
    faseAtual: FaseSessao;
    dataAbertura: Date | null;
    dataSuspensao: Date | null;
    dataEncerramento: Date | null;
    quorumMinimo: number | null;
    quorumPresente: number | null;
    modoTeste: boolean;
    responsavelAberturaId: string | null;
    observacoes: string | null;
    isRemoved: boolean;
    createdAt: Date;
    updatedAt: Date;

    podeTransicionarPara(novoStatus: StatusSessao): boolean {
        return (TRANSICOES[this.statusSessao] ?? []).includes(novoStatus);
    }

    estaAberta(): boolean {
        return this.statusSessao === StatusSessao.ABERTA;
    }

    estaEncerrada(): boolean {
        return this.statusSessao === StatusSessao.ENCERRADA;
    }

    estaCancelada(): boolean {
        return this.statusSessao === StatusSessao.CANCELADA;
    }
}
