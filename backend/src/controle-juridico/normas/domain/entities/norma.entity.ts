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

    toPrimitives(): NormaPrimitives {
        return { ...this.props };
    }
}
