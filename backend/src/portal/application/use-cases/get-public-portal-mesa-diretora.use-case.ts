import { Inject, Injectable } from '@nestjs/common';
import { BoardRepository } from '../../../legislativo/mesa-diretora/domain/repositories/board.repository';
import { BoardStatus } from '../../../legislativo/mesa-diretora/domain/enums/board-status.enum';
import { BOARD_REPOSITORY } from '../../../legislativo/mesa-diretora/mesa-diretora.tokens';
import { LegislatureRepository } from '../../../legislativo/legislaturas/domain/repositories/legislature.repository';
import { LEGISLATURE_REPOSITORY } from '../../../legislativo/legislaturas/legislaturas.tokens';
import { PublicMesaDiretoraViewModel } from '../view-models/public-mesa-diretora.view-model';
import { ResolvePortalTenantUseCase } from './resolve-portal-tenant.use-case';

@Injectable()
export class GetPublicPortalMesaDiretoraUseCase {
    constructor(
        private readonly resolvePortalTenant: ResolvePortalTenantUseCase,
        @Inject(BOARD_REPOSITORY)
        private readonly boardRepository: BoardRepository,
        @Inject(LEGISLATURE_REPOSITORY)
        private readonly legislatureRepository: LegislatureRepository,
    ) {}

    async execute(slug: string) {
        const record = await this.resolvePortalTenant.execute(slug);
        if (!record.portal.secoes.mesaDiretora) {
            return { mesa: null };
        }

        let legislatureId = record.portal.legislaturaId;
        if (!legislatureId) {
            const current = await this.legislatureRepository.findCurrent(
                record.tenantId,
            );
            legislatureId = current?.id;
        }
        if (!legislatureId) {
            return { mesa: null };
        }

        const result = await this.boardRepository.findMany(record.tenantId, {
            legislatureId,
            status: BoardStatus.ACTIVE,
            limit: 1,
            page: 1,
        });

        const board = result.data[0];
        if (!board) {
            return { mesa: null };
        }

        return { mesa: PublicMesaDiretoraViewModel.toHttp(board) };
    }
}
