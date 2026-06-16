import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { StatusSessao } from '../../domain/enums/status-sessao.enum';
import { SuspenderSessaoDto } from '../dto/suspender-sessao.dto';

@Injectable()
export class SuspenderSessaoUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        dto: SuspenderSessaoDto,
        responsavelId: string,
    ): Promise<{ statusSessao: StatusSessao }> {
        const sessao = await this.repository.findSessaoById(sessaoId, tenantId);
        if (!sessao) throw new NotFoundException('Sessão plenária não encontrada');

        if (!sessao.podeTransicionarPara(StatusSessao.SUSPENSA)) {
            throw new BadRequestException(
                `Transição inválida: ${sessao.statusSessao} → ${StatusSessao.SUSPENSA}`,
            );
        }

        await this.repository.transicionarStatus(sessaoId, tenantId, {
            novoStatus: StatusSessao.SUSPENSA,
            responsavelId,
            observacao: dto.observacao,
        });

        return { statusSessao: StatusSessao.SUSPENSA };
    }
}
