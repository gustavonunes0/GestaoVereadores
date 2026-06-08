import { Inject, Injectable } from '@nestjs/common';
import { PARLIAMENTARIAN_REPOSITORY } from '../../../parlamentares/parlamentares.tokens';
import { ParliamentarianRepository } from '../../../parlamentares/domain/repositories/parliamentarian.repository';
import { ParliamentaryFrontRepository } from '../../domain/repositories/parliamentary-front.repository';
import { ParliamentaryFrontDomainService } from '../../domain/services/parliamentary-front-domain.service';
import { PARLIAMENTARY_FRONT_REPOSITORY } from '../../frentes-parlamentares.tokens';
import { UpdateFrenteDto } from '../dto/frente.dto';
import {
    FrenteInvalidDateRangeError,
    FrenteNotFoundError,
    FrenteThemeRequiredError,
    ParliamentarianNotFoundForFrenteError,
} from '../errors/frente.errors';
import { FrenteViewModel } from '../view-models/frente.view-model';

@Injectable()
export class UpdateFrenteUseCase {
    private readonly domainService = new ParliamentaryFrontDomainService();

    constructor(
        @Inject(PARLIAMENTARY_FRONT_REPOSITORY)
        private readonly frontRepository: ParliamentaryFrontRepository,
        @Inject(PARLIAMENTARIAN_REPOSITORY)
        private readonly parliamentarianRepository: ParliamentarianRepository,
    ) {}

    async execute(tenantId: string, id: string, dto: UpdateFrenteDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        const existing = await this.frontRepository.findById(tenantId, id);
        if (!existing) throw new FrenteNotFoundError();

        if (dto.theme !== undefined) {
            try {
                this.domainService.assertThemeProvided(dto.theme);
            } catch {
                throw new FrenteThemeRequiredError();
            }
        }

        const startDate =
            dto.startDate !== undefined
                ? dto.startDate
                    ? new Date(dto.startDate)
                    : null
                : existing.entity.toPrimitives().startDate;
        const endDate =
            dto.endDate !== undefined
                ? dto.endDate
                    ? new Date(dto.endDate)
                    : null
                : existing.entity.toPrimitives().endDate;

        try {
            this.domainService.assertDateRange(startDate, endDate);
        } catch {
            throw new FrenteInvalidDateRangeError();
        }

        if (dto.coordinatorParliamentarianId) {
            const coordinator = await this.parliamentarianRepository.findById(
                tenantId,
                dto.coordinatorParliamentarianId,
            );
            if (!coordinator) {
                throw new ParliamentarianNotFoundForFrenteError();
            }

            const alreadyMember =
                await this.frontRepository.existsMemberByParliamentarian(
                    tenantId,
                    id,
                    dto.coordinatorParliamentarianId,
                );
            if (!alreadyMember) {
                await this.frontRepository.addMember({
                    tenantId,
                    frontId: id,
                    parliamentarianId: dto.coordinatorParliamentarianId,
                });
            }
        }

        const updated = await this.frontRepository.update(tenantId, id, {
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(dto.theme !== undefined ? { theme: dto.theme } : {}),
            ...(dto.description !== undefined
                ? { description: dto.description ?? null }
                : {}),
            ...(dto.startDate !== undefined ? { startDate } : {}),
            ...(dto.endDate !== undefined ? { endDate } : {}),
            ...(dto.status !== undefined ? { status: dto.status } : {}),
            ...(dto.coordinatorParliamentarianId !== undefined
                ? {
                      coordinatorParliamentarianId:
                          dto.coordinatorParliamentarianId ?? null,
                  }
                : {}),
        });

        return FrenteViewModel.toHttp(updated);
    }
}
