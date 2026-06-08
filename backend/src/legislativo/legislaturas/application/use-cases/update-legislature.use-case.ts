import { Inject, Injectable } from '@nestjs/common';
import { LegislatureRepository } from '../../domain/repositories/legislature.repository';
import { LegislatureDomainService } from '../../domain/services/legislature-domain.service';
import { LEGISLATURE_REPOSITORY } from '../../legislaturas.tokens';
import { UpdateLegislatureDto } from '../dto/update-legislature.dto';
import {
    LegislatureInvalidDateRangeError,
    LegislatureNotFoundError,
    LegislatureNumberAlreadyInUseError,
} from '../errors/legislature.errors';
import { LegislatureViewModel } from '../view-models/legislature.view-model';

@Injectable()
export class UpdateLegislatureUseCase {
    private readonly domainService = new LegislatureDomainService();

    constructor(
        @Inject(LEGISLATURE_REPOSITORY)
        private readonly legislatureRepository: LegislatureRepository,
    ) {}

    async execute(tenantId: string, id: string, dto: UpdateLegislatureDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        const existing = await this.legislatureRepository.findById(
            tenantId,
            id,
        );
        try {
            this.domainService.assertBelongsToTenant(existing, tenantId);
        } catch {
            throw new LegislatureNotFoundError();
        }

        if (dto.number !== undefined) {
            const exists = await this.legislatureRepository.existsByNumber(
                tenantId,
                dto.number,
                id,
            );
            try {
                this.domainService.assertNumberAvailable(exists);
            } catch {
                throw new LegislatureNumberAlreadyInUseError();
            }
        }

        const primitives = existing!.toPrimitives();
        const startDate = dto.startDate
            ? new Date(dto.startDate)
            : primitives.startDate;
        const endDate =
            dto.endDate !== undefined
                ? dto.endDate
                    ? new Date(dto.endDate)
                    : null
                : primitives.endDate;

        try {
            this.domainService.assertDateRange(startDate, endDate);
        } catch {
            throw new LegislatureInvalidDateRangeError();
        }

        existing!.update({
            number: dto.number,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            endDate:
                dto.endDate !== undefined
                    ? dto.endDate
                        ? new Date(dto.endDate)
                        : null
                    : undefined,
            isCurrent: dto.isCurrent,
        });

        const p = existing!.toPrimitives();
        const updated = await this.legislatureRepository.update(
            tenantId,
            id,
            {
                number: p.number,
                startDate: p.startDate,
                endDate: p.endDate,
                isCurrent: p.isCurrent,
            },
        );

        if (p.isCurrent) {
            const currentCount =
                await this.legislatureRepository.countCurrentLegislatures(
                    tenantId,
                );
            this.domainService.assertAtMostOneCurrent(currentCount);
        }

        return LegislatureViewModel.toHttp(updated);
    }
}
