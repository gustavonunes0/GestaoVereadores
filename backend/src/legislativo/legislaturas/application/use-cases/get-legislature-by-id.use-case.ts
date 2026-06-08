import { Inject, Injectable } from '@nestjs/common';
import { LegislatureRepository } from '../../domain/repositories/legislature.repository';
import { LegislatureDomainService } from '../../domain/services/legislature-domain.service';
import { LEGISLATURE_REPOSITORY } from '../../legislaturas.tokens';
import { LegislatureNotFoundError } from '../errors/legislature.errors';
import { LegislatureViewModel } from '../view-models/legislature.view-model';

@Injectable()
export class GetLegislatureByIdUseCase {
    private readonly domainService = new LegislatureDomainService();

    constructor(
        @Inject(LEGISLATURE_REPOSITORY)
        private readonly legislatureRepository: LegislatureRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        this.domainService.assertTenantIdProvided(tenantId);

        const legislature = await this.legislatureRepository.findById(
            tenantId,
            id,
        );
        try {
            this.domainService.assertBelongsToTenant(legislature, tenantId);
        } catch {
            throw new LegislatureNotFoundError();
        }

        return LegislatureViewModel.toHttp(legislature!);
    }
}
