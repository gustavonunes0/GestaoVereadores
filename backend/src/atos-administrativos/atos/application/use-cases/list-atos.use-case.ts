import { Injectable } from '@nestjs/common';
import { AtoRepository } from '../../domain/repositories/ato.repository';
import { ListAtosQueryDto } from '../dto/list-atos-query.dto';
import { AtoViewModel } from '../view-models/ato.view-model';

@Injectable()
export class ListAtosUseCase {
    constructor(private readonly atoRepository: AtoRepository) {}

    async execute(query: ListAtosQueryDto) {
        const result = await this.atoRepository.findMany({
            tipoId: query.tipoId,
            classificacaoId: query.classificacaoId,
            numero: query.numero,
            dataPublicacaoDe: query.dataPublicacaoDe,
            dataPublicacaoAte: query.dataPublicacaoAte,
            dataInicioDe: query.dataInicioDe,
            dataInicioAte: query.dataInicioAte,
            dataFimDe: query.dataFimDe,
            dataFimAte: query.dataFimAte,
            page: query.page,
            limit: query.limit,
        });

        return {
            data: result.data.map((item) => AtoViewModel.toHttp(item)),
            meta: result.meta,
        };
    }
}
