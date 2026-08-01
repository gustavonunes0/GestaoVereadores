import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { StatusSessao } from '../../domain/enums/status-sessao.enum';
import { CancelarSessaoDto } from '../dto/cancelar-sessao.dto';
import { SessaoHistoricoRepository } from '../../../sessao-historico/domain/repositories/sessao-historico.repository';
import { TipoEventoSessaoHistorico } from '../../../sessao-historico/domain/enums/tipo-evento-sessao-historico.enum';

@Injectable()
export class CancelarSessaoUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
        private readonly historicoRepository: SessaoHistoricoRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        dto: CancelarSessaoDto,
        responsavelId?: string,
    ): Promise<{ statusSessao: StatusSessao }> {
        const sessao = await this.repository.findSessaoById(sessaoId, tenantId);
        if (!sessao) throw new NotFoundException('Sessão plenária não encontrada');

        if (!sessao.podeTransicionarPara(StatusSessao.CANCELADA)) {
            throw new BadRequestException(
                `Transição inválida: ${sessao.statusSessao} → ${StatusSessao.CANCELADA}`,
            );
        }

        await this.repository.transicionarStatus(sessaoId, tenantId, {
            novoStatus: StatusSessao.CANCELADA,
            responsavelId,
            observacao: dto.observacao,
        });

        await this.historicoRepository.registrar({
            sessaoId,
            tipoEvento: TipoEventoSessaoHistorico.SESSAO_CANCELADA,
            responsavelId,
            descricao: dto.observacao,
        });

        return { statusSessao: StatusSessao.CANCELADA };
    }
}
