import { Inject, Injectable } from '@nestjs/common';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { UpdateSessaoPlenariaDto } from '../dto/update-sessao.dto';
import { SessaoStatusChangeViaUpdateNotAllowedError } from '../errors/sessao.errors';
import {
    SessaoPlenariaPrismaPayload,
    SessaoPlenariaViewModel,
} from '../view-models/sessao-plenaria.view-model';

@Injectable()
export class UpdateSessaoPlenariaUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(tenantId: string, id: string, dto: UpdateSessaoPlenariaDto) {
        if (dto.situacaoId !== undefined) {
            throw new SessaoStatusChangeViaUpdateNotAllowedError();
        }
        const updated = await this.repository.update(tenantId, id, dto);
        return SessaoPlenariaViewModel.toHttp(
            updated as SessaoPlenariaPrismaPayload,
        );
    }
}
