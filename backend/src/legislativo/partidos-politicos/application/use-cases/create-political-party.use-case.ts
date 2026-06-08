import { Inject, Injectable } from '@nestjs/common';
import { PoliticalPartyRepository } from '../../domain/repositories/political-party.repository';
import { PoliticalPartyDomainService } from '../../domain/services/political-party-domain.service';
import { POLITICAL_PARTY_REPOSITORY } from '../../partidos-politicos.tokens';
import { CreatePoliticalPartyDto } from '../dto/create-political-party.dto';
import {
    PoliticalPartyAcronymAlreadyInUseError,
    PoliticalPartyNameAlreadyInUseError,
} from '../errors/political-party.errors';
import { PoliticalPartyViewModel } from '../view-models/political-party.view-model';

@Injectable()
export class CreatePoliticalPartyUseCase {
    private readonly domainService = new PoliticalPartyDomainService();

    constructor(
        @Inject(POLITICAL_PARTY_REPOSITORY)
        private readonly politicalPartyRepository: PoliticalPartyRepository,
    ) {}

    async execute(tenantId: string, dto: CreatePoliticalPartyDto) {
        const acronym = dto.acronym.trim().toUpperCase();
        const trimmedName = dto.name.trim();

        const acronymExists = await this.politicalPartyRepository.existsByAcronym(
            tenantId,
            acronym,
        );
        const nameExists = await this.politicalPartyRepository.existsByName(
            tenantId,
            trimmedName,
        );

        try {
            this.domainService.validateForCreation(
                tenantId,
                acronymExists,
                nameExists,
            );
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('sigla')) {
                    throw new PoliticalPartyAcronymAlreadyInUseError();
                }
                if (error.message.includes('nome')) {
                    throw new PoliticalPartyNameAlreadyInUseError();
                }
            }
            throw error;
        }

        const payload = {
            tenantId,
            name: trimmedName,
            acronym,
            ideology: dto.ideology ?? null,
            flagUrl: dto.flagUrl ?? null,
        };

        const removedByAcronym =
            await this.politicalPartyRepository.findRemovedByAcronym(
                tenantId,
                acronym,
            );

        const saved = removedByAcronym
            ? await this.politicalPartyRepository.reactivate(
                  tenantId,
                  removedByAcronym.id,
                  payload,
              )
            : await this.politicalPartyRepository.create(payload);

        return PoliticalPartyViewModel.toHttp(saved);
    }
}
