import { PaginatedResult } from '../../../../common/dto/pagination.dto';
import { AgendaEventType } from '../enums/agenda-event-type.enum';
import { AgendaLegislativaEntity } from '../entities/agenda-legislativa.entity';

export type CreateAgendaLegislativaInput = {
    tenantId: string;
    tipo?: AgendaEventType | null;
    numero?: string | null;
    titulo?: string | null;
    mensagem?: string | null;
    dataInicio?: Date | null;
    dataFim?: Date | null;
    local?: string | null;
    descricao?: string | null;
    sessaoPlenariaId?: string | null;
    publicoExterno?: boolean;
    linkTransmissao?: string | null;
    recorrencia?: string | null;
    recorrenciaPaiId?: string | null;
};

export type UpdateAgendaLegislativaInput = {
    tipo?: AgendaEventType | null;
    numero?: string | null;
    titulo?: string | null;
    mensagem?: string | null;
    dataInicio?: Date | null;
    dataFim?: Date | null;
    local?: string | null;
    descricao?: string | null;
    sessaoPlenariaId?: string | null;
    publicoExterno?: boolean;
    linkTransmissao?: string | null;
    recorrencia?: string | null;
    recorrenciaPaiId?: string | null;
};

export type ListAgendasLegislativasQuery = {
    tipo?: AgendaEventType;
    dataInicioDe?: Date | null;
    dataInicioAte?: Date | null;
    page?: number;
    limit?: number;
};

export abstract class AgendaLegislativaRepository {
    abstract create(
        data: CreateAgendaLegislativaInput,
    ): Promise<AgendaLegislativaEntity>;

    abstract findAll(
        tenantId: string,
        query: ListAgendasLegislativasQuery,
    ): Promise<PaginatedResult<AgendaLegislativaEntity>>;

    abstract findPublic(
        query: ListAgendasLegislativasQuery,
    ): Promise<PaginatedResult<AgendaLegislativaEntity>>;

    abstract findOne(
        tenantId: string,
        id: string,
    ): Promise<AgendaLegislativaEntity | null>;

    abstract update(
        tenantId: string,
        id: string,
        data: UpdateAgendaLegislativaInput,
    ): Promise<AgendaLegislativaEntity>;

    abstract vincularSessao(
        tenantId: string,
        id: string,
        sessaoPlenariaId: string | null,
    ): Promise<AgendaLegislativaEntity>;

    abstract remove(
        tenantId: string,
        id: string,
    ): Promise<AgendaLegislativaEntity>;
}
