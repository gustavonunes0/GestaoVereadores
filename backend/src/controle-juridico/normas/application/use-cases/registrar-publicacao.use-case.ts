import { Injectable, NotFoundException } from '@nestjs/common';
import { NormaRepository } from '../../domain/repositories/norma.repository';
import { NormaViewModel } from '../view-models/norma.view-model';
import { RegistrarPublicacaoDto } from '../dto/ciclo-juridico.dto';

@Injectable()
export class RegistrarPublicacaoUseCase {
    constructor(private readonly normaRepository: NormaRepository) {}

    async execute(tenantId: string, id: string, dto: RegistrarPublicacaoDto) {
        const norma = await this.normaRepository.findById(tenantId, id);
        if (!norma) throw new NotFoundException('Norma não encontrada');

        const updated = await this.normaRepository.registrarPublicacao(tenantId, id, {
            dataPublicacao: new Date(dto.dataPublicacao),
            dataVigencia: dto.dataVigencia ? new Date(dto.dataVigencia) : null,
        });
        return NormaViewModel.toHttp(updated);
    }
}
