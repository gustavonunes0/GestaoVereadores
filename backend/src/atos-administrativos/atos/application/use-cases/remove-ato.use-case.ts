import { Injectable } from '@nestjs/common';
import { AtoRepository } from '../../domain/repositories/ato.repository';
import { AtoNotFoundError } from '../errors/ato.errors';
import { AtoViewModel } from '../view-models/ato.view-model';

@Injectable()
export class RemoveAtoUseCase {
    constructor(private readonly atoRepository: AtoRepository) {}

    async execute(tenantId: string, id: string) {
        const existing = await this.atoRepository.findById(tenantId, id);
        if (!existing) throw new AtoNotFoundError();

        await this.atoRepository.remove(tenantId, id);
        return AtoViewModel.toHttp(existing);
    }
}
