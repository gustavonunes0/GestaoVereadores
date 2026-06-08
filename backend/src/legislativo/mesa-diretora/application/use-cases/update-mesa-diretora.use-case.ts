import { Inject, Injectable } from '@nestjs/common';
import { BoardRepository } from '../../domain/repositories/board.repository';
import { BoardDomainService } from '../../domain/services/board-domain.service';
import { BOARD_REPOSITORY } from '../../mesa-diretora.tokens';
import { UpdateMesaDiretoraDto } from '../dto/mesa-diretora.dto';
import {
    MesaDiretoraInvalidDateRangeError,
    MesaDiretoraNotFoundError,
} from '../errors/mesa-diretora.errors';
import { MesaDiretoraViewModel } from '../view-models/mesa-diretora.view-model';

@Injectable()
export class UpdateMesaDiretoraUseCase {
    private readonly domainService = new BoardDomainService();

    constructor(
        @Inject(BOARD_REPOSITORY)
        private readonly boardRepository: BoardRepository,
    ) {}

    async execute(tenantId: string, id: string, dto: UpdateMesaDiretoraDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        const existing = await this.boardRepository.findById(tenantId, id);
        if (!existing) throw new MesaDiretoraNotFoundError();

        const primitives = existing.entity.toPrimitives();
        const startDate = dto.startDate
            ? new Date(dto.startDate)
            : primitives.startDate;
        const endDate =
            dto.endDate !== undefined
                ? dto.endDate
                    ? new Date(dto.endDate)
                    : null
                : primitives.endDate;

        try {
            this.domainService.assertDateRange(startDate, endDate);
        } catch {
            throw new MesaDiretoraInvalidDateRangeError();
        }

        existing.entity.update({
            name: dto.name,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            endDate:
                dto.endDate !== undefined
                    ? dto.endDate
                        ? new Date(dto.endDate)
                        : null
                    : undefined,
            status: dto.status,
            notes: dto.notes,
        });

        const p = existing.entity.toPrimitives();
        const updated = await this.boardRepository.update(tenantId, id, {
            name: p.name,
            startDate: p.startDate,
            endDate: p.endDate,
            status: p.status,
            notes: p.notes,
        });

        return MesaDiretoraViewModel.toHttp(updated);
    }
}
