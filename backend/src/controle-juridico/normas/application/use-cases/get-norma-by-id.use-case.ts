import { Injectable } from '@nestjs/common';
import { NormaRepository } from '../../domain/repositories/norma.repository';
import { NormaNotFoundError } from '../errors/norma.errors';
import { NormaViewModel } from '../view-models/norma.view-model';

@Injectable()
export class GetNormaByIdUseCase {
    constructor(private readonly normaRepository: NormaRepository) {}

    async execute(tenantId: string, id: string) {
        const norma = await this.normaRepository.findById(tenantId, id);
        if (!norma) throw new NormaNotFoundError();
        return NormaViewModel.toHttp(norma);
    }
}
