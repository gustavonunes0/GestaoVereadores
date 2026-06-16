import { Injectable, NotFoundException } from '@nestjs/common';
import { NormaRepository } from '../../domain/repositories/norma.repository';
import { NormaViewModel } from '../view-models/norma.view-model';
import { RegistrarVetoDto } from '../dto/ciclo-juridico.dto';

@Injectable()
export class RegistrarVetoUseCase {
    constructor(private readonly normaRepository: NormaRepository) {}

    async execute(tenantId: string, id: string, dto: RegistrarVetoDto) {
        const norma = await this.normaRepository.findById(tenantId, id);
        if (!norma) throw new NotFoundException('Norma não encontrada');

        const updated = await this.normaRepository.registrarVeto(tenantId, id, {
            dataVeto: new Date(dto.dataVeto),
            tipoVeto: dto.tipoVeto ?? null,
            motivoVeto: dto.motivoVeto ?? null,
        });
        return NormaViewModel.toHttp(updated);
    }
}
