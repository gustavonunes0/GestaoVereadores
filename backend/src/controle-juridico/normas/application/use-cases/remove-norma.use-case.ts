import { Injectable } from '@nestjs/common';
import { NormaRepository } from '../../domain/repositories/norma.repository';
import { NormaNotFoundError } from '../errors/norma.errors';
import { NormaViewModel } from '../view-models/norma.view-model';

@Injectable()
export class RemoveNormaUseCase {
    constructor(private readonly normaRepository: NormaRepository) {}

    async execute(tenantId: string, id: string) {
        const existing = await this.normaRepository.findById(tenantId, id);
        if (!existing) throw new NormaNotFoundError();

        await this.normaRepository.softDelete(tenantId, id);
        return NormaViewModel.toHttp(existing);
    }
}
