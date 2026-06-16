import { Inject, Injectable } from '@nestjs/common';
import { toOptionalDate } from '../../../../common/prisma/date-fields';
import { AgendaEventType } from '../../domain/enums/agenda-event-type.enum';
import { AgendaLegislativaRepository } from '../../domain/repositories/agenda-legislativa.repository';
import { AgendaLegislativaDomainService } from '../../domain/services/agenda-legislativa-domain.service';
import { AGENDA_LEGISLATIVA_REPOSITORY } from '../../agenda-legislativa.tokens';
import { UpdateAgendaDto } from '../dto/agenda.dto';
import {
    AgendaInvalidDateRangeError,
    AgendaNotFoundError,
} from '../errors/agenda.errors';
import { AgendaViewModel } from '../view-models/agenda.view-model';

@Injectable()
export class UpdateAgendaUseCase {
    private readonly domainService = new AgendaLegislativaDomainService();

    constructor(
        @Inject(AGENDA_LEGISLATIVA_REPOSITORY)
        private readonly repository: AgendaLegislativaRepository,
    ) {}

    async execute(tenantId: string, id: string, dto: UpdateAgendaDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        const existing = await this.repository.findOne(tenantId, id);
        if (!existing) throw new AgendaNotFoundError();

        const current = existing.toPrimitives();
        const dataInicio =
            dto.dataInicio !== undefined
                ? (toOptionalDate(dto.dataInicio) ?? null)
                : current.dataInicio;
        const dataFim =
            dto.dataFim !== undefined
                ? (toOptionalDate(dto.dataFim) ?? null)
                : current.dataFim;

        try {
            this.domainService.assertDateRange(dataInicio, dataFim);
        } catch {
            throw new AgendaInvalidDateRangeError();
        }

        const updated = await this.repository.update(tenantId, id, {
            ...(dto.tipo !== undefined
                ? { tipo: (dto.tipo as AgendaEventType | undefined) ?? null }
                : {}),
            ...(dto.numero !== undefined ? { numero: dto.numero ?? null } : {}),
            ...(dto.titulo !== undefined ? { titulo: dto.titulo ?? null } : {}),
            ...(dto.mensagem !== undefined ? { mensagem: dto.mensagem ?? null } : {}),
            ...(dto.dataInicio !== undefined
                ? { dataInicio: toOptionalDate(dto.dataInicio) ?? null }
                : {}),
            ...(dto.dataFim !== undefined
                ? { dataFim: toOptionalDate(dto.dataFim) ?? null }
                : {}),
            ...(dto.local !== undefined ? { local: dto.local ?? null } : {}),
            ...(dto.descricao !== undefined ? { descricao: dto.descricao ?? null } : {}),
            ...(dto.sessaoPlenariaId !== undefined ? { sessaoPlenariaId: dto.sessaoPlenariaId ?? null } : {}),
            ...(dto.publicoExterno !== undefined ? { publicoExterno: dto.publicoExterno } : {}),
            ...(dto.linkTransmissao !== undefined ? { linkTransmissao: dto.linkTransmissao ?? null } : {}),
            ...(dto.recorrencia !== undefined ? { recorrencia: dto.recorrencia ?? null } : {}),
            ...(dto.recorrenciaPaiId !== undefined ? { recorrenciaPaiId: dto.recorrenciaPaiId ?? null } : {}),
        });

        return AgendaViewModel.toHttp(updated);
    }
}
