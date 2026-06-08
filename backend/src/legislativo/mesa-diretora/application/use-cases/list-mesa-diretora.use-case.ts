import { Inject, Injectable } from '@nestjs/common';
import { BoardRepository } from '../../domain/repositories/board.repository';
import { BoardDomainService } from '../../domain/services/board-domain.service';
import { BOARD_REPOSITORY } from '../../mesa-diretora.tokens';
import { ListMesaDiretoraQueryDto } from '../dto/mesa-diretora.dto';
import { MesaDiretoraViewModel } from '../view-models/mesa-diretora.view-model';

@Injectable()
export class ListMesaDiretoraUseCase {
    private readonly domainService = new BoardDomainService();

    constructor(
        @Inject(BOARD_REPOSITORY)
        private readonly boardRepository: BoardRepository,
    ) {}

    async execute(tenantId: string, query: ListMesaDiretoraQueryDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        const result = await this.boardRepository.findMany(tenantId, query);
        return {
            data: result.data.map(MesaDiretoraViewModel.toHttp),
            meta: result.meta,
        };
    }
}
