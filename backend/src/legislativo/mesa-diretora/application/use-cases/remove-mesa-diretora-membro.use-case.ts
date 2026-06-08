import { Inject, Injectable } from '@nestjs/common';
import { TenantScopedUpdateError } from '../../../../common/prisma/tenant-scoped-update';
import { BoardRepository } from '../../domain/repositories/board.repository';
import { BoardDomainService } from '../../domain/services/board-domain.service';
import { BOARD_REPOSITORY } from '../../mesa-diretora.tokens';
import {
    MesaDiretoraMembroNotFoundError,
    MesaDiretoraNotFoundError,
} from '../errors/mesa-diretora.errors';
import { MesaDiretoraViewModel } from '../view-models/mesa-diretora.view-model';

@Injectable()
export class RemoveMesaDiretoraMembroUseCase {
    private readonly domainService = new BoardDomainService();

    constructor(
        @Inject(BOARD_REPOSITORY)
        private readonly boardRepository: BoardRepository,
    ) {}

    async execute(tenantId: string, boardId: string, memberId: string) {
        this.domainService.assertTenantIdProvided(tenantId);

        const board = await this.boardRepository.findById(tenantId, boardId);
        if (!board) throw new MesaDiretoraNotFoundError();

        try {
            await this.boardRepository.removeMember(
                tenantId,
                boardId,
                memberId,
            );
        } catch (error) {
            if (error instanceof TenantScopedUpdateError) {
                throw new MesaDiretoraMembroNotFoundError();
            }
            throw error;
        }

        const refreshed = await this.boardRepository.findById(
            tenantId,
            boardId,
        );
        return MesaDiretoraViewModel.toHttp(refreshed!);
    }
}
