import { Injectable } from '@nestjs/common';
import { NormaRepository } from '../../domain/repositories/norma.repository';
import { ListNormasQueryDto } from '../dto/list-normas-query.dto';
import { NormaViewModel } from '../view-models/norma.view-model';

@Injectable()
export class ListPublicNormasUseCase {
    constructor(private readonly normaRepository: NormaRepository) {}

    async execute(tenantId: string, query: ListNormasQueryDto) {
        const result = await this.normaRepository.findPublic(tenantId, {
            search: query.search,
            tipoId: query.tipoId,
            anoId: query.anoId,
            numero: query.numero,
            dataInicio: query.dataInicio,
            dataFim: query.dataFim,
            page: query.page,
            limit: query.limit,
        });

        return {
            data: result.data.map((item) => NormaViewModel.toHttp(item)),
            meta: result.meta,
        };
    }
}
