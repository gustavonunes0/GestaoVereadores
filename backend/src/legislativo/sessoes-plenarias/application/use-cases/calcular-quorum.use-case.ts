import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { SessaoPlenariaRepository, QuorumInfo } from '../../domain/repositories/sessao-plenaria.repository';

@Injectable()
export class CalcularQuorumUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(tenantId: string, sessaoId: string): Promise<QuorumInfo> {
        const sessao = await this.repository.findSessaoById(sessaoId, tenantId);
        if (!sessao) throw new NotFoundException('Sessão plenária não encontrada');

        return this.repository.calcularQuorum(sessaoId, tenantId);
    }
}
