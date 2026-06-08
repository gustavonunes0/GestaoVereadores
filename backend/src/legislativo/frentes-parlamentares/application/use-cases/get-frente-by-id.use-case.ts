import { Inject, Injectable } from '@nestjs/common';
import { ParliamentaryFrontRepository } from '../../domain/repositories/parliamentary-front.repository';
import { ParliamentaryFrontDomainService } from '../../domain/services/parliamentary-front-domain.service';
import { PARLIAMENTARY_FRONT_REPOSITORY } from '../../frentes-parlamentares.tokens';
import { FrenteNotFoundError } from '../errors/frente.errors';
import { FrenteViewModel } from '../view-models/frente.view-model';

@Injectable()
export class GetFrenteByIdUseCase {
    private readonly domainService = new ParliamentaryFrontDomainService();

    constructor(
        @Inject(PARLIAMENTARY_FRONT_REPOSITORY)
        private readonly frontRepository: ParliamentaryFrontRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        this.domainService.assertTenantIdProvided(tenantId);

        const front = await this.frontRepository.findById(tenantId, id);
        if (!front) throw new FrenteNotFoundError();

        return FrenteViewModel.toHttp(front);
    }
}
