import { Inject, Injectable } from '@nestjs/common';
import { toOptionalDate } from '../../../../common/prisma/date-fields';
import { AgendaEventType } from '../../domain/enums/agenda-event-type.enum';
import { AgendaLegislativaRepository } from '../../domain/repositories/agenda-legislativa.repository';
import { AgendaLegislativaDomainService } from '../../domain/services/agenda-legislativa-domain.service';
import { AGENDA_LEGISLATIVA_REPOSITORY } from '../../agenda-legislativa.tokens';
import { CreateAgendaDto } from '../dto/agenda.dto';
import { AgendaInvalidDateRangeError } from '../errors/agenda.errors';
import { AgendaViewModel } from '../view-models/agenda.view-model';

@Injectable()
export class CreateAgendaUseCase {
    private readonly domainService = new AgendaLegislativaDomainService();

    constructor(
        @Inject(AGENDA_LEGISLATIVA_REPOSITORY)
        private readonly repository: AgendaLegislativaRepository,
    ) {}

    async execute(tenantId: string, dto: CreateAgendaDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        const dataInicio = toOptionalDate(dto.dataInicio) ?? null;
        const dataFim = toOptionalDate(dto.dataFim) ?? null;

        try {
            this.domainService.assertDateRange(dataInicio, dataFim);
        } catch {
            throw new AgendaInvalidDateRangeError();
        }

        const saved = await this.repository.create({
            tenantId,
            tipo: (dto.tipo as AgendaEventType | undefined) ?? null,
            numero: dto.numero ?? null,
            titulo: dto.titulo ?? null,
            mensagem: dto.mensagem ?? null,
            dataInicio,
            dataFim,
            local: dto.local ?? null,
            descricao: dto.descricao ?? null,
            sessaoPlenariaId: dto.sessaoPlenariaId ?? null,
            publicoExterno: dto.publicoExterno ?? false,
            linkTransmissao: dto.linkTransmissao ?? null,
            recorrencia: dto.recorrencia ?? null,
            recorrenciaPaiId: dto.recorrenciaPaiId ?? null,
        });

        return AgendaViewModel.toHttp(saved);
    }
}
