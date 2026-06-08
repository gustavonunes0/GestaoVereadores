import { Injectable } from '@nestjs/common';
import { AtoRepository } from '../../domain/repositories/ato.repository';
import { AtoNotFoundError } from '../errors/ato.errors';
import { AtoViewModel } from '../view-models/ato.view-model';

@Injectable()
export class RemoveAtoUseCase {
    constructor(private readonly atoRepository: AtoRepository) {}

    async execute(id: string) {
        const existing = await this.atoRepository.findById(id);
        if (!existing) throw new AtoNotFoundError();

        // TODO: Migrar Ato para soft delete quando o schema incluir isRemoved e removedAt.
        await this.atoRepository.remove(id);
        return AtoViewModel.toHttp(existing);
    }
}
