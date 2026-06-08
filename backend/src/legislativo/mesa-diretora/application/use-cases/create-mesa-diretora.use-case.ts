import { Inject, Injectable } from '@nestjs/common';
import { LEGISLATURE_REPOSITORY } from '../../../legislaturas/legislaturas.tokens';
import { LegislatureRepository } from '../../../legislaturas/domain/repositories/legislature.repository';
import { BoardEntity } from '../../domain/entities/board.entity';
import { BoardRepository } from '../../domain/repositories/board.repository';
import { BoardDomainService } from '../../domain/services/board-domain.service';
import { BOARD_REPOSITORY } from '../../mesa-diretora.tokens';
import { CreateMesaDiretoraDto } from '../dto/mesa-diretora.dto';
import {
    LegislatureNotFoundForMesaDiretoraError,
    MesaDiretoraInvalidDateRangeError,
} from '../errors/mesa-diretora.errors';
import { MesaDiretoraViewModel } from '../view-models/mesa-diretora.view-model';

@Injectable()
export class CreateMesaDiretoraUseCase {
    private readonly domainService = new BoardDomainService();

    constructor(
        @Inject(BOARD_REPOSITORY)
        private readonly boardRepository: BoardRepository,
        @Inject(LEGISLATURE_REPOSITORY)
        private readonly legislatureRepository: LegislatureRepository,
    ) {}

    async execute(tenantId: string, dto: CreateMesaDiretoraDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        const legislature = await this.legislatureRepository.findById(
            tenantId,
            dto.legislatureId,
        );
        if (!legislature) throw new LegislatureNotFoundForMesaDiretoraError();

        const startDate = new Date(dto.startDate);
        const endDate = dto.endDate ? new Date(dto.endDate) : null;

        try {
            this.domainService.assertDateRange(startDate, endDate);
        } catch {
            throw new MesaDiretoraInvalidDateRangeError();
        }

        const board = BoardEntity.create({
            tenantId,
            legislatureId: dto.legislatureId,
            name: dto.name,
            startDate,
            endDate,
            status: dto.status,
            notes: dto.notes ?? null,
        });

        const p = board.toPrimitives();
        const created = await this.boardRepository.create({
            tenantId: p.tenantId,
            legislatureId: p.legislatureId,
            name: p.name,
            startDate: p.startDate,
            endDate: p.endDate,
            status: p.status,
            notes: p.notes,
        });

        return MesaDiretoraViewModel.toHttp(created);
    }
}
