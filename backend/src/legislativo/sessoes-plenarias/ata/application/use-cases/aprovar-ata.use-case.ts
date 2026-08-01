import { Inject, Injectable } from '@nestjs/common';
import { ATA_REPOSITORY } from '../../../sessoes-plenarias.tokens';
import { AtaRepository } from '../../domain/repositories/ata.repository';
import { StatusAta } from '../../domain/enums/status-ata.enum';
import { AtaImutavelAposAprovacaoError, AtaNaoEncontradaError } from '../errors/ata.errors';
import { AtaViewModel } from '../view-models/ata.view-model';
import { SessaoHistoricoRepository } from '../../../../sessao-historico/domain/repositories/sessao-historico.repository';
import { TipoEventoSessaoHistorico } from '../../../../sessao-historico/domain/enums/tipo-evento-sessao-historico.enum';

@Injectable()
export class AprovarAtaUseCase {
    constructor(
        @Inject(ATA_REPOSITORY)
        private readonly ataRepository: AtaRepository,
        private readonly historicoRepository: SessaoHistoricoRepository,
    ) {}

    async execute(tenantId: string, sessaoId: string, responsavelId?: string) {
        const ata = await this.ataRepository.findBySessaoId(sessaoId, tenantId);
        if (!ata) throw new AtaNaoEncontradaError();
        if (!ata.podeSerAprovada()) throw new AtaImutavelAposAprovacaoError();

        const atualizada = await this.ataRepository.update(ata.id, {
            status: StatusAta.APROVADA,
            aprovadaEm: new Date(),
            aprovadaPorId: responsavelId,
        });

        await this.historicoRepository.registrar({
            sessaoId,
            tipoEvento: TipoEventoSessaoHistorico.ATA_APROVADA,
            responsavelId,
            descricao: 'Ata aprovada',
        });

        return AtaViewModel.toHttp(atualizada);
    }
}
