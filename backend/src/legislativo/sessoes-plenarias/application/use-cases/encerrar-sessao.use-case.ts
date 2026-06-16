import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { StatusSessao } from '../../domain/enums/status-sessao.enum';
import { EncerrarSessaoDto } from '../dto/encerrar-sessao.dto';

@Injectable()
export class EncerrarSessaoUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        dto: EncerrarSessaoDto,
        responsavelId: string,
    ): Promise<{ statusSessao: StatusSessao }> {
        const sessao = await this.repository.findSessaoById(sessaoId, tenantId);
        if (!sessao) throw new NotFoundException('Sessão plenária não encontrada');

        if (!sessao.podeTransicionarPara(StatusSessao.ENCERRADA)) {
            throw new BadRequestException(
                `Transição inválida: ${sessao.statusSessao} → ${StatusSessao.ENCERRADA}`,
            );
        }

        await this.repository.transicionarStatus(sessaoId, tenantId, {
            novoStatus: StatusSessao.ENCERRADA,
            responsavelId,
            observacao: dto.observacao,
        });

        return { statusSessao: StatusSessao.ENCERRADA };
    }
}
