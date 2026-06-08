import { Inject, Injectable } from '@nestjs/common';
import { BoardRepository } from '../../domain/repositories/board.repository';
import { BoardDomainService } from '../../domain/services/board-domain.service';
import { BOARD_REPOSITORY } from '../../mesa-diretora.tokens';

@Injectable()
export class ListCargosMesaUseCase {
    private readonly domainService = new BoardDomainService();

    constructor(
        @Inject(BOARD_REPOSITORY)
        private readonly boardRepository: BoardRepository,
    ) {}

    async execute(tenantId: string) {
        this.domainService.assertTenantIdProvided(tenantId);

        await this.boardRepository.ensureDefaultRoles(tenantId);
        const roles = await this.boardRepository.findRoles(tenantId);
        return roles.map((role) => {
            const p = role.toPrimitives();
            return {
                id: p.id,
                name: p.name,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
            };
        });
    }
}
