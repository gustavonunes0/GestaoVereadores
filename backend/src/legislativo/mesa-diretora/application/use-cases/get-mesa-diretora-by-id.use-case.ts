import { Inject, Injectable } from '@nestjs/common';
import { BoardRepository } from '../../domain/repositories/board.repository';
import { BoardDomainService } from '../../domain/services/board-domain.service';
import { BOARD_REPOSITORY } from '../../mesa-diretora.tokens';
import { MesaDiretoraNotFoundError } from '../errors/mesa-diretora.errors';
import { MesaDiretoraViewModel } from '../view-models/mesa-diretora.view-model';

@Injectable()
export class GetMesaDiretoraByIdUseCase {
    private readonly domainService = new BoardDomainService();

    constructor(
        @Inject(BOARD_REPOSITORY)
        private readonly boardRepository: BoardRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        this.domainService.assertTenantIdProvided(tenantId);

        const board = await this.boardRepository.findById(tenantId, id);
        if (!board) throw new MesaDiretoraNotFoundError();

        return MesaDiretoraViewModel.toHttp(board);
    }
}
