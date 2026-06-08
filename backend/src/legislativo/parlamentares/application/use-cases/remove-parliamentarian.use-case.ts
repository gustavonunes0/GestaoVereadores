import { Inject, Injectable } from '@nestjs/common';
import { ParliamentarianRepository } from '../../domain/repositories/parliamentarian.repository';
import { PARLIAMENTARIAN_REPOSITORY } from '../../parlamentares.tokens';
import { ParliamentarianNotFoundError } from '../errors/parliamentarian.errors';
import { ParliamentarianViewModel } from '../view-models/parliamentarian.view-model';

@Injectable()
export class RemoveParliamentarianUseCase {
    constructor(
        @Inject(PARLIAMENTARIAN_REPOSITORY)
        private readonly parliamentarianRepository: ParliamentarianRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        const existing = await this.parliamentarianRepository.findById(
            tenantId,
            id,
        );
        if (!existing) throw new ParliamentarianNotFoundError();
        await this.parliamentarianRepository.softDelete(tenantId, id);
        return ParliamentarianViewModel.toHttp(existing);
    }
}
