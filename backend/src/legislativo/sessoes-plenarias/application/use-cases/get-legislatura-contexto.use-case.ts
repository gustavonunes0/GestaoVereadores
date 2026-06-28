import { Inject, Injectable } from '@nestjs/common';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';

@Injectable()
export class GetLegislaturaContextoUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    execute(tenantId: string) {
        return this.repository.getLegislaturaContexto(tenantId);
    }
}
