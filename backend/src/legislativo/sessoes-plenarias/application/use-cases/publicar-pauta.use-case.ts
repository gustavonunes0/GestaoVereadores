import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { StatusSessao } from '../../domain/enums/status-sessao.enum';

@Injectable()
export class PublicarPautaUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(tenantId: string, sessaoId: string): Promise<void> {
        const sessao = await this.repository.findSessaoById(sessaoId, tenantId);
        if (!sessao) throw new NotFoundException('Sessão plenária não encontrada');

        if (sessao.statusSessao !== StatusSessao.AGENDADA) {
            throw new BadRequestException(
                'Pauta só pode ser publicada quando a sessão está AGENDADA',
            );
        }

        await this.repository.publicarPauta(sessaoId, tenantId);
    }
}
