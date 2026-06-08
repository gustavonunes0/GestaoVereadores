import { ClassificacaoAtoEntity } from './classificacao-ato.entity';
import { TipoAtoEntity } from './tipo-ato.entity';

export type AtoPrimitives = {
    id: string;
    tipoId: string;
    classificacaoId: string;
    numero: string;
    dataInicio: Date | null;
    dataFim: Date | null;
    dataPublicacaoInicio: Date | null;
    dataPublicacaoFim: Date | null;
    mensagem: string | null;
    createdAt: Date;
    updatedAt: Date;
    tipo: { id: string; nome: string };
    classificacao: { id: string; nome: string };
};

export type CreateAtoParams = {
    tipoId: string;
    classificacaoId: string;
    numero: string;
    dataInicio?: Date | null;
    dataFim?: Date | null;
    dataPublicacaoInicio?: Date | null;
    dataPublicacaoFim?: Date | null;
    mensagem?: string | null;
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
        if (params.tipoId !== undefined) {
            this.props.tipoId = params.tipoId;
        }
        if (params.classificacaoId !== undefined) {
            this.props.classificacaoId = params.classificacaoId;
        }
        if (params.numero !== undefined) {
            this.props.numero = params.numero;
        }
        if (params.dataInicio !== undefined) {
            this.props.dataInicio = params.dataInicio;
        }
        if (params.dataFim !== undefined) {
            this.props.dataFim = params.dataFim;
        }
        if (params.dataPublicacaoInicio !== undefined) {
            this.props.dataPublicacaoInicio = params.dataPublicacaoInicio;
        }
        if (params.dataPublicacaoFim !== undefined) {
            this.props.dataPublicacaoFim = params.dataPublicacaoFim;
        }
        if (params.mensagem !== undefined) {
            this.props.mensagem = params.mensagem;
        }
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
