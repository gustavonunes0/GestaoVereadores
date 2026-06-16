import { Injectable } from '@nestjs/common';
import { AtoRepository } from '../../domain/repositories/ato.repository';
import { AtoNotFoundError } from '../errors/ato.errors';
import { AtoViewModel } from '../view-models/ato.view-model';

@Injectable()
export class GetAtoByIdUseCase {
    constructor(private readonly atoRepository: AtoRepository) {}

    async execute(tenantId: string, id: string) {
        const ato = await this.atoRepository.findById(tenantId, id);
        if (!ato) throw new AtoNotFoundError();
        return AtoViewModel.toHttp(ato);
    }
}
