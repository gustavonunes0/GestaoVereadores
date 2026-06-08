import { Inject, Injectable } from '@nestjs/common';
import { PARLIAMENTARIAN_REPOSITORY } from '../../../parlamentares/parlamentares.tokens';
import { ParliamentarianRepository } from '../../../parlamentares/domain/repositories/parliamentarian.repository';
import { ParliamentaryFrontRepository } from '../../domain/repositories/parliamentary-front.repository';
import { ParliamentaryFrontDomainService } from '../../domain/services/parliamentary-front-domain.service';
import { PARLIAMENTARY_FRONT_REPOSITORY } from '../../frentes-parlamentares.tokens';
import { AddMembroFrenteDto } from '../dto/frente.dto';
import {
    FrenteNotFoundError,
    ParliamentarianAlreadyOnFrontError,
    ParliamentarianNotFoundForFrenteError,
} from '../errors/frente.errors';
import { FrenteViewModel } from '../view-models/frente.view-model';

@Injectable()
export class AddFrenteMembroUseCase {
    private readonly domainService = new ParliamentaryFrontDomainService();

    constructor(
        @Inject(PARLIAMENTARY_FRONT_REPOSITORY)
        private readonly frontRepository: ParliamentaryFrontRepository,
        @Inject(PARLIAMENTARIAN_REPOSITORY)
        private readonly parliamentarianRepository: ParliamentarianRepository,
    ) {}

    async execute(tenantId: string, frontId: string, dto: AddMembroFrenteDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        const front = await this.frontRepository.findById(tenantId, frontId);
        if (!front) throw new FrenteNotFoundError();

        const parliamentarian = await this.parliamentarianRepository.findById(
            tenantId,
            dto.parliamentarianId,
        );
        if (!parliamentarian) {
            throw new ParliamentarianNotFoundForFrenteError();
        }

        this.domainService.assertMemberEligibleForFront();

        const alreadyMember =
            await this.frontRepository.existsMemberByParliamentarian(
                tenantId,
                frontId,
                dto.parliamentarianId,
            );
        try {
            this.domainService.assertParliamentarianNotOnFront(alreadyMember);
        } catch {
            throw new ParliamentarianAlreadyOnFrontError();
        }

        await this.frontRepository.addMember({
            tenantId,
            frontId,
            parliamentarianId: dto.parliamentarianId,
        });

        if (dto.setAsCoordinator) {
            await this.frontRepository.update(tenantId, frontId, {
                coordinatorParliamentarianId: dto.parliamentarianId,
            });
        }

        const refreshed = await this.frontRepository.findById(
            tenantId,
            frontId,
        );
        return FrenteViewModel.toHttp(refreshed!);
    }
}
