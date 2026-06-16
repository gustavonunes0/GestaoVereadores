import { StatusNorma } from '../enums/status-norma.enum';

export type NormaTipoSnapshot = { id: string; nome: string };
export type NormaAnoSnapshot = { id: string; valor: number };
export type NormaEsferaSnapshot = { id: string; nome: string };
export type NormaIdentificadorSnapshot = { id: string; nome: string };
export type NormaMateriaOrigemSnapshot = {
    id: string;
    ementa: string;
    numero: number | null;
};

export type NormaPrimitives = {
    id: string;
    tenantId: string;
    tipoId: string;
    numero: string;
    ementa: string;
    anoId: string | null;
    data: Date | null;
    dataPublicacaoInicio: Date | null;
    dataPublicacaoFim: Date | null;
    esferaFederacaoId: string | null;
    identificadorId: string | null;
    materiaOrigemId: string | null;
    mensagem: string | null;
    // M7 — ciclo jurídico
    dataSancao: Date | null;
    dataVeto: Date | null;
    tipoVeto: string | null;
    motivoVeto: string | null;
    dataPromulgacao: Date | null;
    dataPublicacao: Date | null;
    dataVigencia: Date | null;
    dataRevogacao: Date | null;
    normaRevoganteId: string | null;
    textoUrl: string | null;
    // PATCH C2
    complementar: boolean;
    textoIntegralUrl: string | null;
    audioUrl: string | null;
    isRemoved: boolean;
    createdAt: Date;
    updatedAt: Date;
    tipo: NormaTipoSnapshot;
    ano?: NormaAnoSnapshot | null;
    esferaFederacao?: NormaEsferaSnapshot | null;
    identificador?: NormaIdentificadorSnapshot | null;
    materiaOrigem?: NormaMateriaOrigemSnapshot | null;
};

export class NormaEntity {
    private constructor(private readonly props: NormaPrimitives) {}

    static restore(props: NormaPrimitives) {
        return new NormaEntity({
            ...props,
            data: props.data ? new Date(props.data) : null,
            dataPublicacaoInicio: props.dataPublicacaoInicio
                ? new Date(props.dataPublicacaoInicio)
                : null,
            dataPublicacaoFim: props.dataPublicacaoFim
                ? new Date(props.dataPublicacaoFim)
                : null,
            dataSancao: props.dataSancao ? new Date(props.dataSancao) : null,
            dataVeto: props.dataVeto ? new Date(props.dataVeto) : null,
            dataPromulgacao: props.dataPromulgacao ? new Date(props.dataPromulgacao) : null,
            dataPublicacao: props.dataPublicacao ? new Date(props.dataPublicacao) : null,
            dataVigencia: props.dataVigencia ? new Date(props.dataVigencia) : null,
            dataRevogacao: props.dataRevogacao ? new Date(props.dataRevogacao) : null,
            createdAt: new Date(props.createdAt),
            updatedAt: new Date(props.updatedAt),
        });
    }

    get id() {
        return this.props.id;
    }

    get tenantId() {
        return this.props.tenantId;
    }

    get statusDerived(): StatusNorma {
        if (this.props.dataRevogacao) return StatusNorma.REVOGADA;
        if (this.props.dataVigencia) return StatusNorma.VIGENTE;
        if (this.props.dataPublicacao) return StatusNorma.PUBLICADA;
        if (this.props.dataPromulgacao) return StatusNorma.PROMULGADA;
        if (this.props.dataVeto) return StatusNorma.VETADA;
        if (this.props.dataSancao) return StatusNorma.SANCIONADA;
        return StatusNorma.EM_TRAMITE;
    }

    toPrimitives(): NormaPrimitives {
        return { ...this.props };
    }
}
