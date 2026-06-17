import { Inject, Injectable } from '@nestjs/common';
import { ParliamentarianRepository } from '../../domain/repositories/parliamentarian.repository';
import { PARLIAMENTARIAN_REPOSITORY } from '../../parlamentares.tokens';
import { ParliamentarianNotFoundError } from '../errors/parliamentarian.errors';
import { ParliamentarianProfileViewModel } from '../view-models/parliamentarian-profile.view-model';

@Injectable()
export class GetParliamentarianProfileUseCase {
    constructor(
        @Inject(PARLIAMENTARIAN_REPOSITORY)
        private readonly parliamentarianRepository: ParliamentarianRepository,
    ) {}

    async execute(tenantId: string, parliamentarianId: string) {
        const profile = await this.parliamentarianRepository.findProfileById(
            tenantId,
            parliamentarianId,
        );
        if (!profile) {
            throw new ParliamentarianNotFoundError();
        }
        return ParliamentarianProfileViewModel.toHttp(
            profile as Parameters<typeof ParliamentarianProfileViewModel.toHttp>[0],
        );
    }
}
