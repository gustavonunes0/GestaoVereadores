import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { StatusSessao } from '../../domain/enums/status-sessao.enum';
import { SessaoHistoricoRepository } from '../../../sessao-historico/domain/repositories/sessao-historico.repository';
import { TipoEventoSessaoHistorico } from '../../../sessao-historico/domain/enums/tipo-evento-sessao-historico.enum';

@Injectable()
export class IniciarChamadaUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
        private readonly historicoRepository: SessaoHistoricoRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        responsavelId?: string,
    ): Promise<{ statusSessao: StatusSessao; dataInicioChamada: Date }> {
        const sessao = await this.repository.findSessaoById(sessaoId, tenantId);
        if (!sessao) throw new NotFoundException('Sessão plenária não encontrada');

        if (!sessao.podeTransicionarPara(StatusSessao.CHAMADA)) {
            throw new BadRequestException(
                `Transição inválida: ${sessao.statusSessao} → ${StatusSessao.CHAMADA}`,
            );
        }

        await this.repository.transicionarStatus(sessaoId, tenantId, {
            novoStatus: StatusSessao.CHAMADA,
            responsavelId,
        });

        const atualizada = await this.repository.findSessaoById(sessaoId, tenantId);
        const dataInicioChamada = atualizada?.dataInicioChamada ?? new Date();

        await this.historicoRepository.registrar({
            sessaoId,
            tipoEvento: TipoEventoSessaoHistorico.CHAMADA_INICIADA,
            responsavelId,
            descricao: 'Início da chamada (etapa pré-abertura)',
            metadata: { dataInicioChamada: dataInicioChamada.toISOString() },
        });

        return { statusSessao: StatusSessao.CHAMADA, dataInicioChamada };
    }
}
