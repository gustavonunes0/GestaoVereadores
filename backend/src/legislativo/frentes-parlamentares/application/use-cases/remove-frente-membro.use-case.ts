import { Inject, Injectable } from '@nestjs/common';
import { TenantScopedUpdateError } from '../../../../common/prisma/tenant-scoped-update';
import { ParliamentaryFrontRepository } from '../../domain/repositories/parliamentary-front.repository';
import { ParliamentaryFrontDomainService } from '../../domain/services/parliamentary-front-domain.service';
import { PARLIAMENTARY_FRONT_REPOSITORY } from '../../frentes-parlamentares.tokens';
import {
    FrenteMembroNotFoundError,
    FrenteNotFoundError,
} from '../errors/frente.errors';
import { FrenteViewModel } from '../view-models/frente.view-model';

@Injectable()
export class RemoveFrenteMembroUseCase {
    private readonly domainService = new ParliamentaryFrontDomainService();

    constructor(
        @Inject(PARLIAMENTARY_FRONT_REPOSITORY)
        private readonly frontRepository: ParliamentaryFrontRepository,
    ) {}

    async execute(tenantId: string, frontId: string, memberId: string) {
        this.domainService.assertTenantIdProvided(tenantId);

        const front = await this.frontRepository.findById(tenantId, frontId);
        if (!front) throw new FrenteNotFoundError();

        const removedMember = front.members.find(
            (member) => member.id === memberId,
        );

        try {
            await this.frontRepository.removeMember(
                tenantId,
                frontId,
                memberId,
            );
        } catch (error) {
            if (error instanceof TenantScopedUpdateError) {
                throw new FrenteMembroNotFoundError();
            }
            throw error;
        }

        if (
            removedMember &&
            front.entity.toPrimitives().coordinatorParliamentarianId ===
                removedMember.parliamentarian.id
        ) {
            await this.frontRepository.update(tenantId, frontId, {
                coordinatorParliamentarianId: null,
            });
        }

        const refreshed = await this.frontRepository.findById(
            tenantId,
            frontId,
        );
        return FrenteViewModel.toHttp(refreshed!);
    }
}
