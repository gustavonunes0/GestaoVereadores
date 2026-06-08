import { Inject, Injectable } from '@nestjs/common';
import { ParliamentarianRepository } from '../../domain/repositories/parliamentarian.repository';
import { PARLIAMENTARIAN_REPOSITORY } from '../../parlamentares.tokens';
import { ParliamentarianNotFoundError } from '../errors/parliamentarian.errors';
import { ParliamentarianViewModel } from '../view-models/parliamentarian.view-model';

@Injectable()
export class GetParliamentarianByIdUseCase {
    constructor(
        @Inject(PARLIAMENTARIAN_REPOSITORY)
        private readonly parliamentarianRepository: ParliamentarianRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        const parliamentarian = await this.parliamentarianRepository.findById(
            tenantId,
            id,
        );
        if (!parliamentarian) throw new ParliamentarianNotFoundError();
        return ParliamentarianViewModel.toHttp(parliamentarian);
    }
}
