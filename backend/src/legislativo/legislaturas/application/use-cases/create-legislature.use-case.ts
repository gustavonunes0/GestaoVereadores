import { Inject, Injectable } from '@nestjs/common';
import { LegislatureEntity } from '../../domain/entities/legislature.entity';
import { LegislatureRepository } from '../../domain/repositories/legislature.repository';
import { LegislatureDomainService } from '../../domain/services/legislature-domain.service';
import { LEGISLATURE_REPOSITORY } from '../../legislaturas.tokens';
import { CreateLegislatureDto } from '../dto/create-legislature.dto';
import {
    LegislatureInvalidDateRangeError,
    LegislatureNumberAlreadyInUseError,
} from '../errors/legislature.errors';
import { LegislatureViewModel } from '../view-models/legislature.view-model';

@Injectable()
export class CreateLegislatureUseCase {
    private readonly domainService = new LegislatureDomainService();

    constructor(
        @Inject(LEGISLATURE_REPOSITORY)
        private readonly legislatureRepository: LegislatureRepository,
    ) {}

    async execute(tenantId: string, dto: CreateLegislatureDto) {
        const startDate = new Date(dto.startDate);
        const endDate = dto.endDate ? new Date(dto.endDate) : null;

        const numberExists = await this.legislatureRepository.existsByNumber(
            tenantId,
            dto.number,
        );

        try {
            this.domainService.validateForCreation(
                tenantId,
                startDate,
                endDate,
                numberExists,
            );
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('número')) {
                    throw new LegislatureNumberAlreadyInUseError();
                }
                if (error.message.includes('Data fim')) {
                    throw new LegislatureInvalidDateRangeError();
                }
            }
            throw error;
        }

        const isCurrent = dto.isCurrent ?? false;
        const legislature = LegislatureEntity.create({
            tenantId,
            number: dto.number,
            startDate,
            endDate,
            isCurrent,
        });
        const p = legislature.toPrimitives();
        const created = await this.legislatureRepository.create({
            tenantId: p.tenantId,
            number: p.number,
            startDate: p.startDate,
            endDate: p.endDate,
            isCurrent: p.isCurrent,
        });

        if (isCurrent) {
            const currentCount =
                await this.legislatureRepository.countCurrentLegislatures(
                    tenantId,
                );
            this.domainService.assertAtMostOneCurrent(currentCount);
        }

        return LegislatureViewModel.toHttp(created);
    }
}
