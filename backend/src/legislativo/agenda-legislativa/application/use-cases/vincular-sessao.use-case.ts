import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AgendaLegislativaRepository } from '../../domain/repositories/agenda-legislativa.repository';
import { AGENDA_LEGISLATIVA_REPOSITORY } from '../../agenda-legislativa.tokens';
import { VincularSessaoDto } from '../dto/agenda.dto';
import { AgendaViewModel } from '../view-models/agenda.view-model';

@Injectable()
export class VincularSessaoUseCase {
    constructor(
        @Inject(AGENDA_LEGISLATIVA_REPOSITORY)
        private readonly repository: AgendaLegislativaRepository,
    ) {}

    async execute(tenantId: string, id: string, dto: VincularSessaoDto) {
        const existing = await this.repository.findOne(tenantId, id);
        if (!existing) throw new NotFoundException('Agenda não encontrada');

        const updated = await this.repository.vincularSessao(
            tenantId,
            id,
            dto.sessaoPlenariaId ?? null,
        );
        return AgendaViewModel.toHttp(updated);
    }
}
