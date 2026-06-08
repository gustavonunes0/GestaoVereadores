import { Inject, Injectable } from '@nestjs/common';
import { PoliticalPartyRepository } from '../../domain/repositories/political-party.repository';
import { PoliticalPartyDomainService } from '../../domain/services/political-party-domain.service';
import { POLITICAL_PARTY_REPOSITORY } from '../../partidos-politicos.tokens';
import { UpdatePoliticalPartyDto } from '../dto/update-political-party.dto';
import {
    PoliticalPartyAcronymAlreadyInUseError,
    PoliticalPartyNameAlreadyInUseError,
    PoliticalPartyNotFoundError,
} from '../errors/political-party.errors';
import { PoliticalPartyViewModel } from '../view-models/political-party.view-model';

@Injectable()
export class UpdatePoliticalPartyUseCase {
    private readonly domainService = new PoliticalPartyDomainService();

    constructor(
        @Inject(POLITICAL_PARTY_REPOSITORY)
        private readonly politicalPartyRepository: PoliticalPartyRepository,
    ) {}

    async execute(tenantId: string, id: string, dto: UpdatePoliticalPartyDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        const existing = await this.politicalPartyRepository.findById(
            tenantId,
            id,
        );
        try {
            this.domainService.assertBelongsToTenant(existing, tenantId);
        } catch {
            throw new PoliticalPartyNotFoundError();
        }

        if (dto.acronym !== undefined) {
            const acronym = dto.acronym.trim().toUpperCase();
            const exists = await this.politicalPartyRepository.existsByAcronym(
                tenantId,
                acronym,
                id,
            );
            try {
                this.domainService.assertAcronymAvailable(exists);
            } catch {
                throw new PoliticalPartyAcronymAlreadyInUseError();
            }
        }

        if (dto.name !== undefined) {
            const exists = await this.politicalPartyRepository.existsByName(
                tenantId,
                dto.name,
                id,
            );
            try {
                this.domainService.assertNameAvailable(exists);
            } catch {
                throw new PoliticalPartyNameAlreadyInUseError();
            }
        }

        existing!.update({
            name: dto.name,
            acronym: dto.acronym?.trim().toUpperCase(),
            ideology: dto.ideology,
            flagUrl: dto.flagUrl,
        });

        const p = existing!.toPrimitives();
        const updated = await this.politicalPartyRepository.update(
            tenantId,
            id,
            {
                name: p.name,
                acronym: p.acronym,
                ideology: p.ideology,
                flagUrl: p.flagUrl,
            },
        );
        return PoliticalPartyViewModel.toHttp(updated);
    }
}
