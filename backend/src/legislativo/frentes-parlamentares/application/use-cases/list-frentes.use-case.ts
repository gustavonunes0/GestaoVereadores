import { Inject, Injectable } from '@nestjs/common';
import { ParliamentaryFrontRepository } from '../../domain/repositories/parliamentary-front.repository';
import { ParliamentaryFrontDomainService } from '../../domain/services/parliamentary-front-domain.service';
import { PARLIAMENTARY_FRONT_REPOSITORY } from '../../frentes-parlamentares.tokens';
import { ListFrentesQueryDto } from '../dto/frente.dto';
import { FrenteViewModel } from '../view-models/frente.view-model';

@Injectable()
export class ListFrentesUseCase {
    private readonly domainService = new ParliamentaryFrontDomainService();

    constructor(
        @Inject(PARLIAMENTARY_FRONT_REPOSITORY)
        private readonly frontRepository: ParliamentaryFrontRepository,
    ) {}

    async execute(tenantId: string, query: ListFrentesQueryDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        const result = await this.frontRepository.findMany(tenantId, query);
        return {
            ...result,
            data: result.data.map((item) => FrenteViewModel.toHttp(item)),
        };
    }
}
