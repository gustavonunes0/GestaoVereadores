import { Inject, Injectable } from '@nestjs/common';
import { PARLIAMENTARIAN_REPOSITORY } from '../../../parlamentares/parlamentares.tokens';
import { ParliamentarianRepository } from '../../../parlamentares/domain/repositories/parliamentarian.repository';
import { CommitteeRepository } from '../../domain/repositories/committee.repository';
import { CommitteeDomainService } from '../../domain/services/committee-domain.service';
import { COMMITTEE_REPOSITORY } from '../../comissoes.tokens';
import { AddMembroComissaoDto } from '../dto/comissao.dto';
import {
    ComissaoNotFoundError,
    CommitteeExclusiveRoleAlreadyAssignedError,
    ParliamentarianAlreadyOnCommitteeError,
    ParliamentarianNotFoundForComissaoError,
} from '../errors/comissao.errors';
import { ComissaoViewModel } from '../view-models/comissao.view-model';

@Injectable()
export class AddComissaoMembroUseCase {
    private readonly domainService = new CommitteeDomainService();

    constructor(
        @Inject(COMMITTEE_REPOSITORY)
        private readonly committeeRepository: CommitteeRepository,
        @Inject(PARLIAMENTARIAN_REPOSITORY)
        private readonly parliamentarianRepository: ParliamentarianRepository,
    ) {}

    async execute(
        tenantId: string,
        committeeId: string,
        dto: AddMembroComissaoDto,
    ) {
        this.domainService.assertTenantIdProvided(tenantId);

        const committee = await this.committeeRepository.findById(
            tenantId,
            committeeId,
        );
        if (!committee) throw new ComissaoNotFoundError();

        const parliamentarian = await this.parliamentarianRepository.findById(
            tenantId,
            dto.parliamentarianId,
        );
        if (!parliamentarian) {
            throw new ParliamentarianNotFoundForComissaoError();
        }

        const alreadyMember =
            await this.committeeRepository.existsMemberByParliamentarian(
                tenantId,
                committeeId,
                dto.parliamentarianId,
            );
        try {
            this.domainService.assertParliamentarianNotOnCommittee(
                alreadyMember,
            );
        } catch {
            throw new ParliamentarianAlreadyOnCommitteeError();
        }

        const roleOccupied =
            await this.committeeRepository.existsMemberByExclusiveRole(
                tenantId,
                committeeId,
                dto.role,
            );
        try {
            this.domainService.assertExclusiveRoleNotOccupied(
                dto.role,
                roleOccupied,
            );
        } catch {
            throw new CommitteeExclusiveRoleAlreadyAssignedError();
        }

        await this.committeeRepository.addMember({
            tenantId,
            committeeId,
            parliamentarianId: dto.parliamentarianId,
            role: dto.role,
        });

        const refreshed = await this.committeeRepository.findById(
            tenantId,
            committeeId,
        );
        return ComissaoViewModel.toHttp(refreshed!);
    }
}
