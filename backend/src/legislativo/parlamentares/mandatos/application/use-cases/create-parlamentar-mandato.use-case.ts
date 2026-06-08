import { Inject, Injectable } from '@nestjs/common';
import { LEGISLATURE_REPOSITORY } from '../../../../legislaturas/legislaturas.tokens';
import { LegislatureRepository } from '../../../../legislaturas/domain/repositories/legislature.repository';
import { PARLIAMENTARIAN_REPOSITORY } from '../../../parlamentares.tokens';
import { ParliamentarianRepository } from '../../../domain/repositories/parliamentarian.repository';
import { ParliamentarianMandateEntity } from '../../domain/entities/parliamentarian-mandate.entity';
import { ParliamentarianMandateRepository } from '../../domain/repositories/parliamentarian-mandate.repository';
import { ParliamentarianMandateDomainService } from '../../domain/services/parliamentarian-mandate-domain.service';
import { PARLIAMENTARIAN_MANDATE_REPOSITORY } from '../../mandatos.tokens';
import { CreateParlamentarMandatoDto } from '../dto/create-parlamentar-mandato.dto';
import {
    ActiveParlamentarMandatoAlreadyExistsError,
    LegislatureNotFoundForMandateError,
    ParliamentarianNotFoundForMandateError,
} from '../errors/parlamentar-mandato.errors';
import { ParlamentarMandatoViewModel } from '../view-models/parlamentar-mandato.view-model';

@Injectable()
export class CreateParlamentarMandatoUseCase {
    private readonly domainService = new ParliamentarianMandateDomainService();

    constructor(
        @Inject(PARLIAMENTARIAN_MANDATE_REPOSITORY)
        private readonly mandateRepository: ParliamentarianMandateRepository,
        @Inject(PARLIAMENTARIAN_REPOSITORY)
        private readonly parliamentarianRepository: ParliamentarianRepository,
        @Inject(LEGISLATURE_REPOSITORY)
        private readonly legislatureRepository: LegislatureRepository,
    ) {}

    async execute(
        tenantId: string,
        parliamentarianId: string,
        dto: CreateParlamentarMandatoDto,
    ) {
        const parliamentarian = await this.parliamentarianRepository.findById(
            tenantId,
            parliamentarianId,
        );
        if (!parliamentarian) {
            throw new ParliamentarianNotFoundForMandateError();
        }

        const legislature = await this.legislatureRepository.findById(
            tenantId,
            dto.legislatureId,
        );
        if (!legislature) {
            throw new LegislatureNotFoundForMandateError();
        }

        const existing =
            await this.mandateRepository.findByParliamentarianAndLegislature(
                tenantId,
                parliamentarianId,
                dto.legislatureId,
            );

        try {
            this.domainService.assertNoActiveDuplicate(existing?.entity ?? null);
        } catch {
            throw new ActiveParlamentarMandatoAlreadyExistsError();
        }

        const startedAt = dto.startedAt ? new Date(dto.startedAt) : new Date();
        const payload = {
            tenantId,
            parliamentarianId,
            legislatureId: dto.legislatureId,
            partyAcronym: dto.partyAcronym ?? null,
            partyName: dto.partyName ?? null,
            startedAt,
        };

        if (existing) {
            const entity = existing.entity;
            entity.reactivate(payload);
            const p = entity.toPrimitives();
            const saved = await this.mandateRepository.update(
                tenantId,
                entity.id,
                {
                    partyAcronym: p.partyAcronym,
                    partyName: p.partyName,
                    startedAt: p.startedAt,
                    endedAt: null,
                    status: p.status,
                    isRemoved: false,
                    removedAt: null,
                },
            );
            return ParlamentarMandatoViewModel.toHttp(saved);
        }

        const mandate = ParliamentarianMandateEntity.create(payload);
        const p = mandate.toPrimitives();
        const created = await this.mandateRepository.create({
            tenantId: p.tenantId,
            parliamentarianId: p.parliamentarianId,
            legislatureId: p.legislatureId,
            partyAcronym: p.partyAcronym,
            partyName: p.partyName,
            startedAt: p.startedAt,
        });
        return ParlamentarMandatoViewModel.toHttp(created);
    }
}
