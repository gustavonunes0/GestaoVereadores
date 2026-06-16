import { Injectable, NotFoundException } from '@nestjs/common';
import { NormaRepository } from '../../domain/repositories/norma.repository';
import { NormaNotFoundError } from '../errors/norma.errors';
import { NormaViewModel } from '../view-models/norma.view-model';
import { RegistrarSancaoDto } from '../dto/ciclo-juridico.dto';

@Injectable()
export class RegistrarSancaoUseCase {
    constructor(private readonly normaRepository: NormaRepository) {}

    async execute(tenantId: string, id: string, dto: RegistrarSancaoDto) {
        const norma = await this.normaRepository.findById(tenantId, id);
        if (!norma) throw new NotFoundException('Norma não encontrada');

        const updated = await this.normaRepository.registrarSancao(tenantId, id, {
            dataSancao: new Date(dto.dataSancao),
            textoUrl: dto.textoUrl ?? null,
        });
        return NormaViewModel.toHttp(updated);
    }
}
