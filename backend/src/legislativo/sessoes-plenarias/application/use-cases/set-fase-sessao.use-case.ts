import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { FaseSessao } from '../../domain/enums/fase-sessao.enum';
import { StatusSessao } from '../../domain/enums/status-sessao.enum';

@Injectable()
export class SetFaseSessaoUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(sessaoId: string, novaFase: FaseSessao, tenantId: string): Promise<void> {
        const sessao = await this.repository.findSessaoById(sessaoId, tenantId);
        if (!sessao) throw new NotFoundException('Sessão plenária não encontrada');

        if (
            sessao.statusSessao === StatusSessao.ENCERRADA ||
            sessao.statusSessao === StatusSessao.CANCELADA
        ) {
            throw new BadRequestException('Sessão encerrada — não é possível alterar a fase');
        }

        await this.repository.setFase(sessaoId, tenantId, novaFase);
    }
}
