import { Inject, Injectable } from '@nestjs/common';
import { SESSAO_HISTORICO_REPOSITORY } from '../../sessao-historico.tokens';
import { SessaoHistoricoRepository } from '../../domain/repositories/sessao-historico.repository';
import { ListSessaoHistoricoQueryDto } from '../dto/list-sessao-historico-query.dto';
import { SessaoHistoricoViewModel } from '../view-models/sessao-historico.view-model';

@Injectable()
export class ListSessaoHistoricoUseCase {
    constructor(
        @Inject(SESSAO_HISTORICO_REPOSITORY)
        private readonly repository: SessaoHistoricoRepository,
    ) {}

    async execute(sessaoId: string, tenantId: string, query: ListSessaoHistoricoQueryDto) {
        const { data, total } = await this.repository.findMany(sessaoId, tenantId, {
            tipoEvento: query.tipoEvento,
            page: query.page,
            limit: query.limit,
        });

        const page = query.page ?? 1;
        const limit = query.limit ?? 20;

        return {
            data: data.map((item) => SessaoHistoricoViewModel.toHttp(item)),
            meta: {
                page,
                limit,
                total,
                totalPages: total === 0 ? 0 : Math.ceil(total / limit),
            },
        };
    }
}
