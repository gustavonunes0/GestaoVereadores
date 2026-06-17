import { Inject, Injectable } from '@nestjs/common';
import { POLITICAL_PARTY_REPOSITORY } from '../../../partidos-politicos/partidos-politicos.tokens';
import { PoliticalPartyRepository } from '../../../partidos-politicos/domain/repositories/political-party.repository';
import { ParliamentarianRepository } from '../../domain/repositories/parliamentarian.repository';
import { ParlamentarianUserRepository } from '../../domain/repositories/parlamentarian-user.repository';
import { ParliamentarianDomainService } from '../../domain/services/parliamentarian-domain.service';
import {
    PARLIAMENTARIAN_REPOSITORY,
    PARLIAMENTARIAN_USER_REPOSITORY,
} from '../../parlamentares.tokens';
import { UpdateParliamentarianDto } from '../dto/update-parliamentarian.dto';
import {
    ParliamentarianAccessRequiredForPartyError,
    ParliamentarianNotFoundError,
    PoliticalPartyNotFoundForParliamentarianError,
    PoliticalPartyRemovedForParliamentarianError,
} from '../errors/parliamentarian.errors';
import { ParliamentarianViewModel } from '../view-models/parliamentarian.view-model';

@Injectable()
export class UpdateParliamentarianUseCase {
    private readonly domainService = new ParliamentarianDomainService();

    constructor(
        @Inject(PARLIAMENTARIAN_REPOSITORY)
        private readonly parliamentarianRepository: ParliamentarianRepository,
        @Inject(PARLIAMENTARIAN_USER_REPOSITORY)
        private readonly parlamentarianUserRepository: ParlamentarianUserRepository,
        @Inject(POLITICAL_PARTY_REPOSITORY)
        private readonly politicalPartyRepository: PoliticalPartyRepository,
    ) {}

    async execute(tenantId: string, id: string, dto: UpdateParliamentarianDto) {
        const existing = await this.parliamentarianRepository.findById(
            tenantId,
            id,
        );
        if (!existing) throw new ParliamentarianNotFoundError();

        if (dto.politicalPartyId !== undefined) {
            if (!existing.user) {
                throw new ParliamentarianAccessRequiredForPartyError();
            }
            if (dto.politicalPartyId !== null) {
                await this.assertPoliticalPartyForParliamentarian(
                    tenantId,
                    dto.politicalPartyId,
                );
            }
            await this.parlamentarianUserRepository.updatePoliticalParty(
                tenantId,
                id,
                dto.politicalPartyId,
            );
        }

        existing.entity.update({
            parliamentaryName: dto.parliamentaryName,
            officeNumber: dto.officeNumber,
            photoUrl: dto.photoUrl,
            biography: dto.biography,
            status: dto.status,
        });

        const p = existing.entity.toPrimitives();
        await this.parliamentarianRepository.update(tenantId, id, {
            parliamentaryName: p.parliamentaryName,
            officeNumber: p.officeNumber,
            photoUrl: p.photoUrl,
            biography: p.biography,
            status: p.status,
        });

        const updated = await this.parliamentarianRepository.findById(
            tenantId,
            id,
        );
        if (!updated) throw new ParliamentarianNotFoundError();
        return ParliamentarianViewModel.toHttp(updated);
    }

    private async assertPoliticalPartyForParliamentarian(
        tenantId: string,
        politicalPartyId: string,
    ) {
        const party = await this.politicalPartyRepository.findAnyById(
            tenantId,
            politicalPartyId,
        );
        try {
            this.domainService.assertPoliticalPartyUsable(party, tenantId);
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.includes('removido')
            ) {
                throw new PoliticalPartyRemovedForParliamentarianError();
            }
            throw new PoliticalPartyNotFoundForParliamentarianError();
        }
    }
}
