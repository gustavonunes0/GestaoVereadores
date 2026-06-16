import { ClassificacaoAtoEntity } from './classificacao-ato.entity';
import { TipoAtoEntity } from './tipo-ato.entity';

export type AtoPrimitives = {
    id: string;
    tenantId: string | null;
    tipoId: string;
    classificacaoId: string;
    numero: string;
    dataInicio: Date | null;
    dataFim: Date | null;
    dataPublicacaoInicio: Date | null;
    dataPublicacaoFim: Date | null;
    mensagem: string | null;
    // M7 fields (PATCH C3)
    ementa: string | null;
    dataAto: Date | null;
    anexoUrl: string | null;
    textoUrl: string | null;
    identificadorId: string | null;
    isRemoved: boolean;
    createdAt: Date;
    updatedAt: Date;
    tipo: { id: string; nome: string };
    classificacao: { id: string; nome: string };
};

export type CreateAtoParams = {
    tenantId?: string | null;
    tipoId: string;
    classificacaoId: string;
    numero: string;
    dataInicio?: Date | null;
    dataFim?: Date | null;
    dataPublicacaoInicio?: Date | null;
    dataPublicacaoFim?: Date | null;
    mensagem?: string | null;
    ementa?: string | null;
    dataAto?: Date | null;
    anexoUrl?: string | null;
    textoUrl?: string | null;
    identificadorId?: string | null;
};

export type UpdateAtoParams = {
    tipoId?: string;
    classificacaoId?: string;
    numero?: string;
    dataInicio?: Date | null;
    dataFim?: Date | null;
    dataPublicacaoInicio?: Date | null;
    dataPublicacaoFim?: Date | null;
    mensagem?: string | null;
    ementa?: string | null;
    dataAto?: Date | null;
    anexoUrl?: string | null;
    textoUrl?: string | null;
    identificadorId?: string | null;
};

export class AtoEntity {
    private constructor(
        private props: Omit<AtoPrimitives, 'tipo' | 'classificacao'>,
        private readonly tipo: TipoAtoEntity,
        private readonly classificacao: ClassificacaoAtoEntity,
    ) {}

    static restore(data: AtoPrimitives) {
        return new AtoEntity(
            {
                id: data.id,
                tenantId: data.tenantId,
                tipoId: data.tipoId,
                classificacaoId: data.classificacaoId,
                numero: data.numero,
                dataInicio: data.dataInicio ? new Date(data.dataInicio) : null,
                dataFim: data.dataFim ? new Date(data.dataFim) : null,
                dataPublicacaoInicio: data.dataPublicacaoInicio
                    ? new Date(data.dataPublicacaoInicio)
                    : null,
                dataPublicacaoFim: data.dataPublicacaoFim
                    ? new Date(data.dataPublicacaoFim)
                    : null,
                mensagem: data.mensagem,
                ementa: data.ementa,
                dataAto: data.dataAto ? new Date(data.dataAto) : null,
                anexoUrl: data.anexoUrl,
                textoUrl: data.textoUrl,
                identificadorId: data.identificadorId,
                isRemoved: data.isRemoved,
                createdAt: new Date(data.createdAt),
                updatedAt: new Date(data.updatedAt),
            },
            TipoAtoEntity.restore(data.tipo),
            ClassificacaoAtoEntity.restore(data.classificacao),
        );
    }

    get id() {
        return this.props.id;
    }

    get tenantId() {
        return this.props.tenantId;
    }

    get tipoId() {
        return this.props.tipoId;
    }

    get classificacaoId() {
        return this.props.classificacaoId;
    }

    get numero() {
        return this.props.numero;
    }

    applyUpdate(params: UpdateAtoParams) {
        if (params.tipoId !== undefined) this.props.tipoId = params.tipoId;
        if (params.classificacaoId !== undefined) this.props.classificacaoId = params.classificacaoId;
        if (params.numero !== undefined) this.props.numero = params.numero;
        if (params.dataInicio !== undefined) this.props.dataInicio = params.dataInicio;
        if (params.dataFim !== undefined) this.props.dataFim = params.dataFim;
        if (params.dataPublicacaoInicio !== undefined) this.props.dataPublicacaoInicio = params.dataPublicacaoInicio;
        if (params.dataPublicacaoFim !== undefined) this.props.dataPublicacaoFim = params.dataPublicacaoFim;
        if (params.mensagem !== undefined) this.props.mensagem = params.mensagem;
        if (params.ementa !== undefined) this.props.ementa = params.ementa;
        if (params.dataAto !== undefined) this.props.dataAto = params.dataAto;
        if (params.anexoUrl !== undefined) this.props.anexoUrl = params.anexoUrl;
        if (params.textoUrl !== undefined) this.props.textoUrl = params.textoUrl;
        if (params.identificadorId !== undefined) this.props.identificadorId = params.identificadorId;
        this.props.updatedAt = new Date();
    }

    toPrimitives(): AtoPrimitives {
        return {
            ...this.props,
            tipo: this.tipo.toPrimitives(),
            classificacao: this.classificacao.toPrimitives(),
        };
    }
}
