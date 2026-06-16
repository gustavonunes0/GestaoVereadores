import { Injectable, NotFoundException } from '@nestjs/common';
import { NormaRepository } from '../../domain/repositories/norma.repository';
import { NormaViewModel } from '../view-models/norma.view-model';
import { RegistrarPromulgacaoDto } from '../dto/ciclo-juridico.dto';

@Injectable()
export class RegistrarPromulgacaoUseCase {
    constructor(private readonly normaRepository: NormaRepository) {}

    async execute(tenantId: string, id: string, dto: RegistrarPromulgacaoDto) {
        const norma = await this.normaRepository.findById(tenantId, id);
        if (!norma) throw new NotFoundException('Norma não encontrada');

        const updated = await this.normaRepository.registrarPromulgacao(tenantId, id, {
            dataPromulgacao: new Date(dto.dataPromulgacao),
        });
        return NormaViewModel.toHttp(updated);
    }
}
