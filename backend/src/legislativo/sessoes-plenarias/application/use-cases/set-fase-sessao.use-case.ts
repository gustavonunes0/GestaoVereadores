import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { FaseSessao } from '../../domain/enums/fase-sessao.enum';
import { StatusSessao } from '../../domain/enums/status-sessao.enum';
import { SessaoHistoricoRepository } from '../../../sessao-historico/domain/repositories/sessao-historico.repository';
import { TipoEventoSessaoHistorico } from '../../../sessao-historico/domain/enums/tipo-evento-sessao-historico.enum';

@Injectable()
export class SetFaseSessaoUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
        private readonly historicoRepository: SessaoHistoricoRepository,
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

        const faseAnterior = sessao.faseAtual;
        await this.repository.setFase(sessaoId, tenantId, novaFase);

        await this.historicoRepository.registrar({
            sessaoId,
            tipoEvento: TipoEventoSessaoHistorico.FASE_ALTERADA,
            metadata: { faseAnterior, faseNova: novaFase },
        });
    }
}
