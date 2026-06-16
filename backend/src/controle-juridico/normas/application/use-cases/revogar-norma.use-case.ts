import { Injectable, NotFoundException } from '@nestjs/common';
import { NormaRepository } from '../../domain/repositories/norma.repository';
import { NormaViewModel } from '../view-models/norma.view-model';
import { RevogarNormaDto } from '../dto/ciclo-juridico.dto';

@Injectable()
export class RevogarNormaUseCase {
    constructor(private readonly normaRepository: NormaRepository) {}

    async execute(tenantId: string, id: string, dto: RevogarNormaDto) {
        const norma = await this.normaRepository.findById(tenantId, id);
        if (!norma) throw new NotFoundException('Norma não encontrada');

        const updated = await this.normaRepository.revogar(tenantId, id, {
            dataRevogacao: new Date(dto.dataRevogacao),
            normaRevoganteId: dto.normaRevoganteId ?? null,
        });
        return NormaViewModel.toHttp(updated);
    }
}
