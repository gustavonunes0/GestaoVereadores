import { Inject, Injectable } from '@nestjs/common';
import { CommitteeRepository } from '../../domain/repositories/committee.repository';
import { CommitteeDomainService } from '../../domain/services/committee-domain.service';
import { COMMITTEE_REPOSITORY } from '../../comissoes.tokens';
import { UpdateComissaoDto } from '../dto/comissao.dto';
import {
    ComissaoAcronymAlreadyInUseError,
    ComissaoInvalidDateRangeError,
    ComissaoNotFoundError,
    ComissaoPurposeRequiredError,
} from '../errors/comissao.errors';
import { ComissaoViewModel } from '../view-models/comissao.view-model';

@Injectable()
export class UpdateComissaoUseCase {
    private readonly domainService = new CommitteeDomainService();

    constructor(
        @Inject(COMMITTEE_REPOSITORY)
        private readonly committeeRepository: CommitteeRepository,
    ) {}

    async execute(tenantId: string, id: string, dto: UpdateComissaoDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        const existing = await this.committeeRepository.findById(
            tenantId,
            id,
        );
        if (!existing) throw new ComissaoNotFoundError();

        if (dto.purpose !== undefined) {
            try {
                this.domainService.assertPurposeProvided(dto.purpose);
            } catch {
                throw new ComissaoPurposeRequiredError();
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
            throw new ComissaoInvalidDateRangeError();
        }

        const acronym =
            dto.acronym !== undefined
                ? dto.acronym.trim().toUpperCase() || null
                : undefined;

        if (acronym) {
            const exists = await this.committeeRepository.existsByAcronym(
                tenantId,
                acronym,
                id,
            );
            try {
                this.domainService.assertAcronymAvailable(exists);
            } catch {
                throw new ComissaoAcronymAlreadyInUseError();
            }
        }

        const updated = await this.committeeRepository.update(tenantId, id, {
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(acronym !== undefined ? { acronym } : {}),
            ...(dto.type !== undefined ? { type: dto.type } : {}),
            ...(dto.purpose !== undefined ? { purpose: dto.purpose } : {}),
            ...(dto.startDate !== undefined ? { startDate } : {}),
            ...(dto.endDate !== undefined ? { endDate } : {}),
            ...(dto.status !== undefined ? { status: dto.status } : {}),
            ...(dto.notes !== undefined ? { notes: dto.notes ?? null } : {}),
        });

        return ComissaoViewModel.toHttp(updated);
    }
}
