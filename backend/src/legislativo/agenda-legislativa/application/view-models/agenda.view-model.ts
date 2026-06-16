import { AgendaLegislativaEntity } from '../../domain/entities/agenda-legislativa.entity';
import { AgendaEventType } from '../../domain/enums/agenda-event-type.enum';
import {
    AGENDA_EVENT_TYPE_LABELS,
    AGENDA_EVENT_TYPES,
} from '../../domain/enums/agenda-event-type.enum';

export type AgendaHttp = {
    id: string;
    tipo?: AgendaEventType;
    tipoLabel?: string;
    numero?: string;
    titulo?: string;
    dataInicio?: Date;
    dataFim?: Date;
    mensagem?: string;
    local?: string;
    descricao?: string;
    sessaoPlenariaId?: string;
    publicoExterno: boolean;
    linkTransmissao?: string;
    recorrencia?: string;
    recorrenciaPaiId?: string;
    createdAt: Date;
    updatedAt: Date;
};

export type AgendaEventTypeHttp = {
    value: AgendaEventType;
    label: string;
};

export class AgendaViewModel {
    static toHttp(entity: AgendaLegislativaEntity): AgendaHttp {
        const p = entity.toPrimitives();
        return {
            id: p.id,
            ...(p.tipo
                ? {
                      tipo: p.tipo,
                      tipoLabel: AGENDA_EVENT_TYPE_LABELS[p.tipo],
                  }
                : {}),
            ...(p.numero ? { numero: p.numero } : {}),
            ...(p.titulo ? { titulo: p.titulo } : {}),
            ...(p.dataInicio ? { dataInicio: p.dataInicio } : {}),
            ...(p.dataFim ? { dataFim: p.dataFim } : {}),
            ...(p.mensagem ? { mensagem: p.mensagem } : {}),
            ...(p.local ? { local: p.local } : {}),
            ...(p.descricao ? { descricao: p.descricao } : {}),
            ...(p.sessaoPlenariaId ? { sessaoPlenariaId: p.sessaoPlenariaId } : {}),
            publicoExterno: p.publicoExterno,
            ...(p.linkTransmissao ? { linkTransmissao: p.linkTransmissao } : {}),
            ...(p.recorrencia ? { recorrencia: p.recorrencia } : {}),
            ...(p.recorrenciaPaiId ? { recorrenciaPaiId: p.recorrenciaPaiId } : {}),
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }

    static listEventTypes(): AgendaEventTypeHttp[] {
        return AGENDA_EVENT_TYPES.map((value) => ({
            value,
            label: AGENDA_EVENT_TYPE_LABELS[value],
        }));
    }
}
