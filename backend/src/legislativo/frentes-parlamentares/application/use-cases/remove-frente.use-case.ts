import { Inject, Injectable } from '@nestjs/common';
import { TenantScopedUpdateError } from '../../../../common/prisma/tenant-scoped-update';
import { ParliamentaryFrontRepository } from '../../domain/repositories/parliamentary-front.repository';
import { ParliamentaryFrontDomainService } from '../../domain/services/parliamentary-front-domain.service';
import { PARLIAMENTARY_FRONT_REPOSITORY } from '../../frentes-parlamentares.tokens';
import { FrenteNotFoundError } from '../errors/frente.errors';

@Injectable()
export class RemoveFrenteUseCase {
    private readonly domainService = new ParliamentaryFrontDomainService();

    constructor(
        @Inject(PARLIAMENTARY_FRONT_REPOSITORY)
        private readonly frontRepository: ParliamentaryFrontRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        this.domainService.assertTenantIdProvided(tenantId);

        const existing = await this.frontRepository.findById(tenantId, id);
        if (!existing) throw new FrenteNotFoundError();

        try {
            await this.frontRepository.softDelete(tenantId, id);
        } catch (error) {
            if (error instanceof TenantScopedUpdateError) {
                throw new FrenteNotFoundError();
            }
            throw error;
        }
    }
}
