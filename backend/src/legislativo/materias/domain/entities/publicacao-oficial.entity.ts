export type PublicacaoOficialProps = {
    id: string;
    tenantId: string;
    materiaId: string | null;
    normaId: string | null;
    dataPublicacao: Date;
    veiculo: string;
    paginaInicio: number | null;
    paginaFim: number | null;
    identificador: string | null;
    urlExterna: string | null;
    textoIntegral: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export class PublicacaoOficial {
    readonly id: string;
    readonly tenantId: string;
    readonly materiaId: string | null;
    readonly normaId: string | null;
    readonly dataPublicacao: Date;
    readonly veiculo: string;
    readonly paginaInicio: number | null;
    readonly paginaFim: number | null;
    readonly identificador: string | null;
    readonly urlExterna: string | null;
    readonly textoIntegral: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: PublicacaoOficialProps) {
        this.id = props.id;
        this.tenantId = props.tenantId;
        this.materiaId = props.materiaId;
        this.normaId = props.normaId;
        this.dataPublicacao = props.dataPublicacao;
        this.veiculo = props.veiculo;
        this.paginaInicio = props.paginaInicio;
        this.paginaFim = props.paginaFim;
        this.identificador = props.identificador;
        this.urlExterna = props.urlExterna;
        this.textoIntegral = props.textoIntegral;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}
