import { Inject, Injectable } from '@nestjs/common';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import {
    SessaoPlenariaNotFoundError,
} from '../errors/sessao.errors';
import {
    SessaoPlenariaPrismaPayload,
    SessaoPlenariaViewModel,
} from '../view-models/sessao-plenaria.view-model';

@Injectable()
export class GetSessaoPlenariaByIdUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        try {
            const item = await this.repository.findOne(tenantId, id);
            return SessaoPlenariaViewModel.toHttp(
                item as SessaoPlenariaPrismaPayload,
            );
        } catch {
            throw new SessaoPlenariaNotFoundError();
        }
    }
}
