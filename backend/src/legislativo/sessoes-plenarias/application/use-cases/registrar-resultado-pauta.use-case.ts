import { Inject, Injectable } from '@nestjs/common';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { RegistrarResultadoPautaDto } from '../dto/sessao.dto';

@Injectable()
export class RegistrarResultadoPautaUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    execute(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: RegistrarResultadoPautaDto,
    ) {
        return this.repository.registrarResultadoPauta(
            tenantId,
            sessaoId,
            pautaItemId,
            dto,
        );
    }
}
