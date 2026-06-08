import { Inject, Injectable } from '@nestjs/common';
import { ActiveParliamentarianMandateChecker } from '../../domain/contracts/active-parliamentarian-mandate-checker';
import { ParliamentarianMandateRepository } from '../../domain/repositories/parliamentarian-mandate.repository';
import { PARLIAMENTARIAN_MANDATE_REPOSITORY } from '../../mandatos.tokens';

@Injectable()
export class PrismaActiveParliamentarianMandateChecker extends ActiveParliamentarianMandateChecker {
    constructor(
        @Inject(PARLIAMENTARIAN_MANDATE_REPOSITORY)
        private readonly mandateRepository: ParliamentarianMandateRepository,
    ) {
        super();
    }

    hasActiveMandate(
        tenantId: string,
        parliamentarianId: string,
        legislatureId: string,
    ) {
        return this.mandateRepository.hasActiveMandate(
            tenantId,
            parliamentarianId,
            legislatureId,
        );
    }
}
