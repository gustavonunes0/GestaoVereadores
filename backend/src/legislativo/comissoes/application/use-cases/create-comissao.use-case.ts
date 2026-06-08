import { Inject, Injectable } from '@nestjs/common';
import { CommitteeEntity } from '../../domain/entities/committee.entity';
import { CommitteeRepository } from '../../domain/repositories/committee.repository';
import { CommitteeDomainService } from '../../domain/services/committee-domain.service';
import { COMMITTEE_REPOSITORY } from '../../comissoes.tokens';
import { CreateComissaoDto } from '../dto/comissao.dto';
import {
    ComissaoAcronymAlreadyInUseError,
    ComissaoInvalidDateRangeError,
    ComissaoPurposeRequiredError,
} from '../errors/comissao.errors';
import { ComissaoViewModel } from '../view-models/comissao.view-model';

@Injectable()
export class CreateComissaoUseCase {
    private readonly domainService = new CommitteeDomainService();

    constructor(
        @Inject(COMMITTEE_REPOSITORY)
        private readonly committeeRepository: CommitteeRepository,
    ) {}

    async execute(tenantId: string, dto: CreateComissaoDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        try {
            this.domainService.assertPurposeProvided(dto.purpose);
        } catch {
            throw new ComissaoPurposeRequiredError();
        }

        const startDate = dto.startDate ? new Date(dto.startDate) : null;
        const endDate = dto.endDate ? new Date(dto.endDate) : null;

        try {
            this.domainService.assertDateRange(startDate, endDate);
        } catch {
            throw new ComissaoInvalidDateRangeError();
        }

        const acronym = dto.acronym?.trim().toUpperCase() || null;
        if (acronym) {
            const exists = await this.committeeRepository.existsByAcronym(
                tenantId,
                acronym,
            );
            try {
                this.domainService.assertAcronymAvailable(exists);
            } catch {
                throw new ComissaoAcronymAlreadyInUseError();
            }
        }

        const committee = CommitteeEntity.create({
            tenantId,
            name: dto.name,
            acronym,
            type: dto.type,
            purpose: dto.purpose,
            startDate,
            endDate,
            status: dto.status,
            notes: dto.notes ?? null,
        });

        const p = committee.toPrimitives();
        const created = await this.committeeRepository.create({
            tenantId: p.tenantId,
            name: p.name,
            acronym: p.acronym,
            type: p.type,
            purpose: p.purpose,
            startDate: p.startDate,
            endDate: p.endDate,
            status: p.status,
            notes: p.notes,
        });

        return ComissaoViewModel.toHttp(created);
    }
}
