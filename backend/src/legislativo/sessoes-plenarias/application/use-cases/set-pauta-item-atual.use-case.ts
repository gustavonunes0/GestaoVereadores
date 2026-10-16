import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { StatusSessao } from '../../domain/enums/status-sessao.enum';
import { SetPautaItemAtualDto } from '../dto/set-pauta-item-atual.dto';

@Injectable()
export class SetPautaItemAtualUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        dto: SetPautaItemAtualDto,
    ): Promise<{ pautaItemAtualId: string | null }> {
        const sessao = await this.repository.findSessaoById(sessaoId, tenantId);
        if (!sessao) throw new NotFoundException('Sessão plenária não encontrada');

        if (
            sessao.statusSessao !== StatusSessao.ABERTA &&
            sessao.statusSessao !== StatusSessao.SUSPENSA
        ) {
            throw new BadRequestException(
                'Só é possível definir o item atual com a sessão aberta ou suspensa.',
            );
        }

        const pautaItemId = dto.pautaItemId === undefined ? null : dto.pautaItemId;
        return this.repository.setPautaItemAtual(sessaoId, tenantId, pautaItemId);
    }
}
