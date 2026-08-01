import { Inject, Injectable } from '@nestjs/common';
import { ATA_REPOSITORY } from '../../../sessoes-plenarias.tokens';
import { AtaRepository } from '../../domain/repositories/ata.repository';
import { AtaNaoEncontradaError } from '../errors/ata.errors';
import { AtaViewModel } from '../view-models/ata.view-model';

@Injectable()
export class GetAtaBySessaoUseCase {
    constructor(
        @Inject(ATA_REPOSITORY)
        private readonly ataRepository: AtaRepository,
    ) {}

    async execute(tenantId: string, sessaoId: string) {
        const ata = await this.ataRepository.findBySessaoId(sessaoId, tenantId);
        if (!ata) throw new AtaNaoEncontradaError();
        return AtaViewModel.toHttp(ata);
    }
}
