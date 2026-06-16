import { MatterStatus } from '../enums/matter-status.enum';
import { TramitacaoHistorico } from './tramitacao-historico.entity';
import { PublicacaoOficial } from './publicacao-oficial.entity';

const TRANSICOES: Record<MatterStatus, MatterStatus[]> = {
    [MatterStatus.DRAFT]: [MatterStatus.PROTOCOLADA],
    [MatterStatus.PROTOCOLADA]: [MatterStatus.EM_TRAMITACAO],
    [MatterStatus.EM_TRAMITACAO]: [
        MatterStatus.EM_PAUTA,
        MatterStatus.ARQUIVADA,
        MatterStatus.RETIRADA,
    ],
    [MatterStatus.EM_PAUTA]: [
        MatterStatus.APROVADA,
        MatterStatus.REJEITADA,
        MatterStatus.EM_TRAMITACAO,
    ],
    [MatterStatus.APROVADA]: [MatterStatus.TRANSFORMADA_EM_NORMA],
    [MatterStatus.REJEITADA]: [],
    [MatterStatus.ARQUIVADA]: [],
    [MatterStatus.RETIRADA]: [],
    [MatterStatus.TRANSFORMADA_EM_NORMA]: [],
};

export type MateriaProps = {
    id: string;
    tenantId: string;
    tipoId: string;
    sigla: string;
    numero: number | null;
    anoId: string | null;
    anoValor: number | null;
    ementa: string;
    justificativa: string | null;
    textoOriginalUrl: string | null;
    textoIntegralUrl: string | null;
    audioUrl: string | null;
    dataProtocolo: Date | null;
    status: MatterStatus;
    autorId: string | null;
    isRemoved: boolean;
    removedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    tramitacaoHistorico?: TramitacaoHistorico[];
    publicacoesOficiais?: PublicacaoOficial[];
};

export class Materia {
    readonly id: string;
    readonly tenantId: string;
    readonly tipoId: string;
    readonly sigla: string;
    readonly numero: number | null;
    readonly anoId: string | null;
    readonly anoValor: number | null;
    readonly ementa: string;
    readonly justificativa: string | null;
    readonly textoOriginalUrl: string | null;
    readonly textoIntegralUrl: string | null;
    readonly audioUrl: string | null;
    readonly dataProtocolo: Date | null;
    readonly status: MatterStatus;
    readonly autorId: string | null;
    readonly isRemoved: boolean;
    readonly removedAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly tramitacaoHistorico: TramitacaoHistorico[];
    readonly publicacoesOficiais: PublicacaoOficial[];

    constructor(props: MateriaProps) {
        this.id = props.id;
        this.tenantId = props.tenantId;
        this.tipoId = props.tipoId;
        this.sigla = props.sigla;
        this.numero = props.numero;
        this.anoId = props.anoId;
        this.anoValor = props.anoValor;
        this.ementa = props.ementa;
        this.justificativa = props.justificativa;
        this.textoOriginalUrl = props.textoOriginalUrl;
        this.textoIntegralUrl = props.textoIntegralUrl;
        this.audioUrl = props.audioUrl;
        this.dataProtocolo = props.dataProtocolo;
        this.status = props.status;
        this.autorId = props.autorId;
        this.isRemoved = props.isRemoved;
        this.removedAt = props.removedAt;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.tramitacaoHistorico = props.tramitacaoHistorico ?? [];
        this.publicacoesOficiais = props.publicacoesOficiais ?? [];
    }

    get identificacao(): string {
        const ano = this.anoValor ?? this.anoId ?? '?';
        return `${this.sigla} nº ${this.numero ?? '?'}/${ano}`;
    }

    podeTransicionarPara(novoStatus: MatterStatus): boolean {
        return (TRANSICOES[this.status] ?? []).includes(novoStatus);
    }
}
