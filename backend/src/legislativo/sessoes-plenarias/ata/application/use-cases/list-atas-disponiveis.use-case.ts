import { Inject, Injectable } from '@nestjs/common';
import { ATA_REPOSITORY } from '../../../sessoes-plenarias.tokens';
import { AtaRepository } from '../../domain/repositories/ata.repository';
import { AtaResumoViewModel } from '../view-models/ata-resumo.view-model';

/**
 * Atas de outras sessões do tenant, para vincular a um item de pauta do tipo ATA.
 * Inclui rascunhos de propósito: a ata da sessão anterior costuma chegar à sessão
 * seguinte ainda sem aprovação — é justamente o que se lê e aprova em plenário.
 */
@Injectable()
export class ListAtasDisponiveisUseCase {
    constructor(
        @Inject(ATA_REPOSITORY)
        private readonly ataRepository: AtaRepository,
    ) {}

    async execute(tenantId: string, excluirSessaoId?: string) {
        const resumos = await this.ataRepository.listResumos(tenantId, {
            excluirSessaoId,
        });
        return resumos.map((resumo) => AtaResumoViewModel.toHttp(resumo));
    }
}
