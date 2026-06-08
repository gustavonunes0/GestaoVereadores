/** Tipos de evento no calendário legislativo (task 30). */
export enum AgendaEventType {
    SESSAO = 'SESSAO',
    REUNIAO = 'REUNIAO',
    AUDIENCIA = 'AUDIENCIA',
    EVENTO = 'EVENTO',
    COMPROMISSO = 'COMPROMISSO',
}

export const AGENDA_EVENT_TYPE_LABELS: Record<AgendaEventType, string> = {
    [AgendaEventType.SESSAO]: 'Sessão',
    [AgendaEventType.REUNIAO]: 'Reunião',
    [AgendaEventType.AUDIENCIA]: 'Audiência',
    [AgendaEventType.EVENTO]: 'Evento',
    [AgendaEventType.COMPROMISSO]: 'Compromisso',
};

export const AGENDA_EVENT_TYPES = Object.values(AgendaEventType);
