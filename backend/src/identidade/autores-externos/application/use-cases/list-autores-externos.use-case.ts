import { Inject, Injectable } from '@nestjs/common';
import { AutorExternoRepository } from '../../domain/repositories/autor-externo.repository';
import { AUTOR_EXTERNO_REPOSITORY } from '../../autores-externos.tokens';
import { ListAutoresExternosQueryDto } from '../dto/list-autores-externos-query.dto';
import { AutorExternoViewModel } from '../view-models/autor-externo.view-model';

@Injectable()
export class ListAutoresExternosIdentidadeUseCase {
    constructor(
        @Inject(AUTOR_EXTERNO_REPOSITORY)
        private readonly repository: AutorExternoRepository,
    ) {}

    async execute(tenantId: string, query: ListAutoresExternosQueryDto) {
        const result = await this.repository.findMany(tenantId, query);
        return {
            data: result.data.map((item) => AutorExternoViewModel.toHttp(item)),
            meta: result.meta,
        };
    }
}
