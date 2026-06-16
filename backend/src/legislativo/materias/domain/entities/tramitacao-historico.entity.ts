import { MatterStatus } from '../enums/matter-status.enum';

export type TramitacaoHistoricoProps = {
    id: string;
    materiaId: string;
    dataHora: Date;
    statusAnterior: MatterStatus | null;
    statusNovo: MatterStatus;
    responsavelId: string | null;
    despacho: string | null;
    observacao: string | null;
    unidadeOrigemId: string | null;
    unidadeDestinoId: string | null;
};

export class TramitacaoHistorico {
    readonly id: string;
    readonly materiaId: string;
    readonly dataHora: Date;
    readonly statusAnterior: MatterStatus | null;
    readonly statusNovo: MatterStatus;
    readonly responsavelId: string | null;
    readonly despacho: string | null;
    readonly observacao: string | null;
    readonly unidadeOrigemId: string | null;
    readonly unidadeDestinoId: string | null;

    constructor(props: TramitacaoHistoricoProps) {
        this.id = props.id;
        this.materiaId = props.materiaId;
        this.dataHora = props.dataHora;
        this.statusAnterior = props.statusAnterior;
        this.statusNovo = props.statusNovo;
        this.responsavelId = props.responsavelId;
        this.despacho = props.despacho;
        this.observacao = props.observacao;
        this.unidadeOrigemId = props.unidadeOrigemId;
        this.unidadeDestinoId = props.unidadeDestinoId;
    }
}

export type CreateTramitacaoHistoricoData = {
    materiaId: string;
    statusAnterior: MatterStatus | null;
    statusNovo: MatterStatus;
    responsavelId?: string;
    despacho?: string;
    observacao?: string;
    unidadeOrigemId?: string;
    unidadeDestinoId?: string;
};
