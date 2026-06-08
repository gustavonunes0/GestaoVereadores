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
};

export type UpdateAgendaLegislativaParams = {
    tipo?: AgendaEventType | null;
    numero?: string | null;
    titulo?: string | null;
    dataInicio?: Date | null;
    dataFim?: Date | null;
    mensagem?: string | null;
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

    applyUpdate(params: UpdateAgendaLegislativaParams) {
        if (params.tipo !== undefined) this.props.tipo = params.tipo;
        if (params.numero !== undefined) this.props.numero = params.numero;
        if (params.titulo !== undefined) this.props.titulo = params.titulo;
        if (params.dataInicio !== undefined) {
            this.props.dataInicio = params.dataInicio;
        }
        if (params.dataFim !== undefined) this.props.dataFim = params.dataFim;
        if (params.mensagem !== undefined) this.props.mensagem = params.mensagem;
        this.props.updatedAt = new Date();
    }

    toPrimitives(): AgendaLegislativaPrimitives {
        return { ...this.props };
    }
}
