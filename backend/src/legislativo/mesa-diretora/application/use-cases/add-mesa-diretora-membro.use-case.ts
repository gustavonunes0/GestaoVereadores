import { Inject, Injectable } from '@nestjs/common';
import { PARLIAMENTARIAN_REPOSITORY } from '../../../parlamentares/parlamentares.tokens';
import { ParliamentarianRepository } from '../../../parlamentares/domain/repositories/parliamentarian.repository';
import { BoardRepository } from '../../domain/repositories/board.repository';
import { BoardDomainService } from '../../domain/services/board-domain.service';
import { BOARD_REPOSITORY } from '../../mesa-diretora.tokens';
import { AddMembroMesaDto } from '../dto/mesa-diretora.dto';
import {
    BoardRoleAlreadyOccupiedError,
    BoardRoleNotFoundForMesaDiretoraError,
    MesaDiretoraNotFoundError,
    ParliamentarianAlreadyOnBoardError,
    ParliamentarianNotFoundForMesaDiretoraError,
} from '../errors/mesa-diretora.errors';
import { MesaDiretoraViewModel } from '../view-models/mesa-diretora.view-model';

@Injectable()
export class AddMesaDiretoraMembroUseCase {
    private readonly domainService = new BoardDomainService();

    constructor(
        @Inject(BOARD_REPOSITORY)
        private readonly boardRepository: BoardRepository,
        @Inject(PARLIAMENTARIAN_REPOSITORY)
        private readonly parliamentarianRepository: ParliamentarianRepository,
    ) {}

    async execute(tenantId: string, boardId: string, dto: AddMembroMesaDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        const board = await this.boardRepository.findById(tenantId, boardId);
        if (!board) throw new MesaDiretoraNotFoundError();

        const parliamentarian = await this.parliamentarianRepository.findById(
            tenantId,
            dto.parliamentarianId,
        );
        if (!parliamentarian) {
            throw new ParliamentarianNotFoundForMesaDiretoraError();
        }

        const role = await this.boardRepository.findRoleById(
            tenantId,
            dto.boardRoleId,
        );
        if (!role) throw new BoardRoleNotFoundForMesaDiretoraError();

        const roleOccupied = await this.boardRepository.existsMemberByRole(
            tenantId,
            boardId,
            dto.boardRoleId,
        );
        try {
            this.domainService.assertRoleNotOccupied(roleOccupied);
        } catch {
            throw new BoardRoleAlreadyOccupiedError();
        }

        const alreadyMember =
            await this.boardRepository.existsMemberByParliamentarian(
                tenantId,
                boardId,
                dto.parliamentarianId,
            );
        try {
            this.domainService.assertParliamentarianNotOnBoard(alreadyMember);
        } catch {
            throw new ParliamentarianAlreadyOnBoardError();
        }

        await this.boardRepository.addMember({
            tenantId,
            boardId,
            parliamentarianId: dto.parliamentarianId,
            boardRoleId: dto.boardRoleId,
        });

        const refreshed = await this.boardRepository.findById(
            tenantId,
            boardId,
        );
        return MesaDiretoraViewModel.toHttp(refreshed!);
    }
}
