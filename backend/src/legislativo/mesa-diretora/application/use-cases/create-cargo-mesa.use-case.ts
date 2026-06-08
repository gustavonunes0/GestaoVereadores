import { Inject, Injectable } from '@nestjs/common';
import { BoardRoleEntity } from '../../domain/entities/board-role.entity';
import { BoardRepository } from '../../domain/repositories/board.repository';
import { BoardDomainService } from '../../domain/services/board-domain.service';
import { BOARD_REPOSITORY } from '../../mesa-diretora.tokens';
import { CreateCargoMesaDto } from '../dto/mesa-diretora.dto';
import { BoardRoleNameAlreadyInUseError } from '../errors/mesa-diretora.errors';

@Injectable()
export class CreateCargoMesaUseCase {
    private readonly domainService = new BoardDomainService();

    constructor(
        @Inject(BOARD_REPOSITORY)
        private readonly boardRepository: BoardRepository,
    ) {}

    async execute(tenantId: string, dto: CreateCargoMesaDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        const exists = await this.boardRepository.existsRoleByName(
            tenantId,
            dto.name,
        );
        try {
            this.domainService.assertRoleNameAvailable(exists);
        } catch {
            throw new BoardRoleNameAlreadyInUseError();
        }

        const role = BoardRoleEntity.create({
            tenantId,
            name: dto.name,
        });
        const created = await this.boardRepository.createRole({
            tenantId,
            name: role.name,
        });

        const p = created.toPrimitives();
        return {
            id: p.id,
            name: p.name,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }
}
