import { Inject, Injectable } from '@nestjs/common';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { FilterSessaoPlenariaDto } from '../dto/sessao.dto';
import {
    SessaoPlenariaPrismaPayload,
    SessaoPlenariaViewModel,
} from '../view-models/sessao-plenaria.view-model';

@Injectable()
export class ListSessoesPlenariasUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(tenantId: string, filters: FilterSessaoPlenariaDto) {
        const result = await this.repository.findAll(tenantId, filters);
        const paginated = result as {
            data: SessaoPlenariaPrismaPayload[];
            meta: unknown;
        };
        return {
            ...paginated,
            data: paginated.data.map((item) =>
                SessaoPlenariaViewModel.toHttp(item),
            ),
        };
    }
}
