import { Inject, Injectable } from '@nestjs/common';
import { ATA_REPOSITORY } from '../../../sessoes-plenarias.tokens';
import { AtaRepository } from '../../domain/repositories/ata.repository';
import { AtaImutavelAposAprovacaoError, AtaNaoEncontradaError } from '../errors/ata.errors';
import { UpdateAtaDto } from '../dto/update-ata.dto';
import { AtaViewModel } from '../view-models/ata.view-model';

@Injectable()
export class UpdateAtaUseCase {
    constructor(
        @Inject(ATA_REPOSITORY)
        private readonly ataRepository: AtaRepository,
    ) {}

    async execute(tenantId: string, sessaoId: string, dto: UpdateAtaDto) {
        const ata = await this.ataRepository.findBySessaoId(sessaoId, tenantId);
        if (!ata) throw new AtaNaoEncontradaError();
        if (!ata.podeSerEditada()) throw new AtaImutavelAposAprovacaoError();

        const atualizada = await this.ataRepository.update(ata.id, { conteudo: dto.conteudo });
        return AtaViewModel.toHttp(atualizada);
    }
}
