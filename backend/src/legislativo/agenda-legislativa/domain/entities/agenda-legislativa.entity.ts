import { AgendaEventType } from '../enums/agenda-event-type.enum';

export type AgendaLegislativaPrimitives = {
    id: string;
    tenantId: string;
    tipo: AgendaEventType | null;
    numero: string | null;
    titulo: string | null;
    dataInicio: Date | null;
    dataFim: Date | null;
    mensagem: string | null;
    // M6 fields
    local: string | null;
    descricao: string | null;
    sessaoPlenariaId: string | null;
    publicoExterno: boolean;
    linkTransmissao: string | null;
    recorrencia: string | null;
    recorrenciaPaiId: string | null;
    isRemoved: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type CreateAgendaLegislativaParams = {
    tenantId: string;
    tipo?: AgendaEventType | null;
    numero?: string | null;
    titulo?: string | null;
    dataInicio?: Date | null;
    dataFim?: Date | null;
    mensagem?: string | null;
    local?: string | null;
    descricao?: string | null;
    sessaoPlenariaId?: string | null;
    publicoExterno?: boolean;
    linkTransmissao?: string | null;
    recorrencia?: string | null;
    recorrenciaPaiId?: string | null;
};

export type UpdateAgendaLegislativaParams = {
    tipo?: AgendaEventType | null;
    numero?: string | null;
    titulo?: string | null;
    dataInicio?: Date | null;
    dataFim?: Date | null;
    mensagem?: string | null;
    local?: string | null;
    descricao?: string | null;
    sessaoPlenariaId?: string | null;
    publicoExterno?: boolean;
    linkTransmissao?: string | null;
    recorrencia?: string | null;
    recorrenciaPaiId?: string | null;
};

export class AgendaLegislativaEntity {
    private constructor(private props: AgendaLegislativaPrimitives) {}

    static restore(data: AgendaLegislativaPrimitives) {
        return new AgendaLegislativaEntity({
            ...data,
            dataInicio: data.dataInicio ? new Date(data.dataInicio) : null,
            dataFim: data.dataFim ? new Date(data.dataFim) : null,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
        });
    }

    get id() {
        return this.props.id;
    }

    get tenantId() {
        return this.props.tenantId;
    }

    temRecorrencia(): boolean {
        return this.props.recorrencia !== null;
    }

    eOcorrencia(): boolean {
        return this.props.recorrenciaPaiId !== null;
    }

    applyUpdate(params: UpdateAgendaLegislativaParams) {
        if (params.tipo !== undefined) this.props.tipo = params.tipo;
        if (params.numero !== undefined) this.props.numero = params.numero;
        if (params.titulo !== undefined) this.props.titulo = params.titulo;
        if (params.dataInicio !== undefined) {
            this.props.dataInicio = params.dataInicio;
        }
        if (params.dataFim !== undefined) this.props.dataFim = params.dataFim;
        if (params.mensagem !== undefined) this.props.mensagem = params.mensagem;
        if (params.local !== undefined) this.props.local = params.local;
        if (params.descricao !== undefined) this.props.descricao = params.descricao;
        if (params.sessaoPlenariaId !== undefined) this.props.sessaoPlenariaId = params.sessaoPlenariaId;
        if (params.publicoExterno !== undefined) this.props.publicoExterno = params.publicoExterno;
        if (params.linkTransmissao !== undefined) this.props.linkTransmissao = params.linkTransmissao;
        if (params.recorrencia !== undefined) this.props.recorrencia = params.recorrencia;
        if (params.recorrenciaPaiId !== undefined) this.props.recorrenciaPaiId = params.recorrenciaPaiId;
        this.props.updatedAt = new Date();
    }

    toPrimitives(): AgendaLegislativaPrimitives {
        return { ...this.props };
    }
}
