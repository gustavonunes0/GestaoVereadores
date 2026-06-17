import { Inject, Injectable } from '@nestjs/common';
import { ParliamentarianRepository } from '../../domain/repositories/parliamentarian.repository';
import { ParlamentarianUserRepository } from '../../domain/repositories/parlamentarian-user.repository';
import {
    PARLIAMENTARIAN_REPOSITORY,
    PARLIAMENTARIAN_USER_REPOSITORY,
} from '../../parlamentares.tokens';
import { ParliamentarianAccessNotFoundError } from '../errors/parliamentarian-access.errors';
import { ParliamentarianNotFoundError } from '../errors/parliamentarian.errors';

@Injectable()
export class RevokeParliamentarianAccessUseCase {
    constructor(
        @Inject(PARLIAMENTARIAN_REPOSITORY)
        private readonly parliamentarianRepository: ParliamentarianRepository,
        @Inject(PARLIAMENTARIAN_USER_REPOSITORY)
        private readonly parlamentarianUserRepository: ParlamentarianUserRepository,
    ) {}

    async execute(tenantId: string, parliamentarianId: string) {
        const parliamentarian = await this.parliamentarianRepository.findById(
            tenantId,
            parliamentarianId,
        );
        if (!parliamentarian) {
            throw new ParliamentarianNotFoundError();
        }

        try {
            await this.parlamentarianUserRepository.deactivate(
                tenantId,
                parliamentarianId,
            );
        } catch {
            throw new ParliamentarianAccessNotFoundError();
        }

        const updated = await this.parliamentarianRepository.findById(
            tenantId,
            parliamentarianId,
        );
        if (!updated) {
            throw new ParliamentarianNotFoundError();
        }
        return updated;
    }
}
