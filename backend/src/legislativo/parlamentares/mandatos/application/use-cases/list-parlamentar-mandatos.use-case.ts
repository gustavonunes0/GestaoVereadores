import { Inject, Injectable } from '@nestjs/common';
import { PARLIAMENTARIAN_REPOSITORY } from '../../../parlamentares.tokens';
import { ParliamentarianRepository } from '../../../domain/repositories/parliamentarian.repository';
import { ParliamentarianMandateRepository } from '../../domain/repositories/parliamentarian-mandate.repository';
import { PARLIAMENTARIAN_MANDATE_REPOSITORY } from '../../mandatos.tokens';
import { ListParlamentarMandatosQueryDto } from '../dto/list-parlamentar-mandatos-query.dto';
import { ParliamentarianNotFoundForMandateError } from '../errors/parlamentar-mandato.errors';
import { ParlamentarMandatoViewModel } from '../view-models/parlamentar-mandato.view-model';

@Injectable()
export class ListParlamentarMandatosUseCase {
    constructor(
        @Inject(PARLIAMENTARIAN_MANDATE_REPOSITORY)
        private readonly mandateRepository: ParliamentarianMandateRepository,
        @Inject(PARLIAMENTARIAN_REPOSITORY)
        private readonly parliamentarianRepository: ParliamentarianRepository,
    ) {}

    async execute(
        tenantId: string,
        parliamentarianId: string,
        query: ListParlamentarMandatosQueryDto,
    ) {
        const parliamentarian = await this.parliamentarianRepository.findById(
            tenantId,
            parliamentarianId,
        );
        if (!parliamentarian) {
            throw new ParliamentarianNotFoundForMandateError();
        }

        const result = await this.mandateRepository.findMany(
            tenantId,
            parliamentarianId,
            query,
        );

        return {
            ...result,
            data: result.data.map(ParlamentarMandatoViewModel.toHttp),
        };
    }
}
