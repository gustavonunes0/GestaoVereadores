import { Inject, Injectable } from '@nestjs/common';
import { MandateStatus } from '../../domain/enums/mandate-status.enum';
import { ParliamentarianMandateRepository } from '../../domain/repositories/parliamentarian-mandate.repository';
import { ParliamentarianMandateDomainService } from '../../domain/services/parliamentarian-mandate-domain.service';
import { PARLIAMENTARIAN_MANDATE_REPOSITORY } from '../../mandatos.tokens';
import { FinishParlamentarMandatoDto } from '../dto/finish-parlamentar-mandato.dto';
import {
    ParlamentarMandatoAlreadyFinishedError,
    ParlamentarMandatoInvalidDateRangeError,
    ParlamentarMandatoInvalidFinishStatusError,
    ParlamentarMandatoNotFoundError,
    ParliamentarianNotFoundForMandateError,
} from '../errors/parlamentar-mandato.errors';
import { ParlamentarMandatoViewModel } from '../view-models/parlamentar-mandato.view-model';
import { PARLIAMENTARIAN_REPOSITORY } from '../../../parlamentares.tokens';
import { ParliamentarianRepository } from '../../../domain/repositories/parliamentarian.repository';

const FINISH_STATUSES = new Set<MandateStatus>([
    MandateStatus.FINISHED,
    MandateStatus.INTERRUPTED,
    MandateStatus.LICENSED,
]);

@Injectable()
export class FinishParlamentarMandatoUseCase {
    private readonly domainService = new ParliamentarianMandateDomainService();

    constructor(
        @Inject(PARLIAMENTARIAN_MANDATE_REPOSITORY)
        private readonly mandateRepository: ParliamentarianMandateRepository,
        @Inject(PARLIAMENTARIAN_REPOSITORY)
        private readonly parliamentarianRepository: ParliamentarianRepository,
    ) {}

    async execute(
        tenantId: string,
        parliamentarianId: string,
        mandateId: string,
        dto: FinishParlamentarMandatoDto,
    ) {
        const parliamentarian = await this.parliamentarianRepository.findById(
            tenantId,
            parliamentarianId,
        );
        if (!parliamentarian) {
            throw new ParliamentarianNotFoundForMandateError();
        }

        const mandate = await this.mandateRepository.findById(
            tenantId,
            mandateId,
        );
        if (
            !mandate ||
            mandate.entity.parliamentarianId !== parliamentarianId
        ) {
            throw new ParlamentarMandatoNotFoundError();
        }

        try {
            this.domainService.assertCanFinish(mandate.entity);
        } catch {
            throw new ParlamentarMandatoAlreadyFinishedError();
        }

        const status = dto.status ?? MandateStatus.FINISHED;
        if (!FINISH_STATUSES.has(status)) {
            throw new ParlamentarMandatoInvalidFinishStatusError();
        }

        const endedAt = dto.endedAt ? new Date(dto.endedAt) : new Date();

        try {
            mandate.entity.finish({ status, endedAt });
        } catch {
            throw new ParlamentarMandatoInvalidDateRangeError();
        }

        const p = mandate.entity.toPrimitives();
        const saved = await this.mandateRepository.update(tenantId, mandateId, {
            status: p.status,
            endedAt: p.endedAt,
        });
        return ParlamentarMandatoViewModel.toHttp(saved);
    }
}
