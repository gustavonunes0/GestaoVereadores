import { Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { SituacaoPresenca } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { StatusSessao } from '../../domain/enums/status-sessao.enum';
import { ReiniciarChamadaDto } from '../dto/reiniciar-chamada.dto';
import { SessaoHistoricoRepository } from '../../../sessao-historico/domain/repositories/sessao-historico.repository';
import { TipoEventoSessaoHistorico } from '../../../sessao-historico/domain/enums/tipo-evento-sessao-historico.enum';

@Injectable()
export class ReiniciarChamadaUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
        private readonly prisma: PrismaService,
        private readonly historicoRepository: SessaoHistoricoRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        dto: ReiniciarChamadaDto,
        responsavelId?: string,
    ) {
        const sessao = await this.repository.findSessaoById(sessaoId, tenantId);
        if (!sessao) throw new NotFoundException('Sessão plenária não encontrada');

        if (sessao.statusSessao !== StatusSessao.ABERTA) {
            throw new UnprocessableEntityException(
                'A chamada só pode ser reiniciada com a sessão aberta',
            );
        }

        await this.prisma.presencaSessao.updateMany({
            where: { sessaoId },
            data: { situacao: SituacaoPresenca.AUSENTE, presente: false },
        });

        await this.historicoRepository.registrar({
            sessaoId,
            tipoEvento: TipoEventoSessaoHistorico.CHAMADA_REINICIADA,
            responsavelId,
            descricao: `Chamada reiniciada — ${dto.justificativa}`,
            metadata: { justificativa: dto.justificativa },
        });

        return { reiniciada: true };
    }
}
