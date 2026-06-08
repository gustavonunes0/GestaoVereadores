import { Inject, Injectable } from '@nestjs/common';
import { TENANT_USER_REPOSITORY } from '../../../../identidade/tenant-users/tenant-users.tokens';
import { TenantUserRepository } from '../../../../identidade/tenant-users/domain/repositories/tenant-user.repository';
import { PARLIAMENTARIAN_REPOSITORY } from '../../../parlamentares/parlamentares.tokens';
import { ParliamentarianRepository } from '../../../parlamentares/domain/repositories/parliamentarian.repository';
import { ParliamentaryFrontEntity } from '../../domain/entities/parliamentary-front.entity';
import { ParliamentaryFrontRepository } from '../../domain/repositories/parliamentary-front.repository';
import { ParliamentaryFrontDomainService } from '../../domain/services/parliamentary-front-domain.service';
import { PARLIAMENTARY_FRONT_REPOSITORY } from '../../frentes-parlamentares.tokens';
import { CreateFrenteDto } from '../dto/frente.dto';
import {
    FrenteInvalidDateRangeError,
    FrenteThemeRequiredError,
    ParliamentarianNotFoundForFrenteError,
    TenantUserNotFoundForFrenteError,
} from '../errors/frente.errors';
import { FrenteViewModel } from '../view-models/frente.view-model';

@Injectable()
export class CreateFrenteUseCase {
    private readonly domainService = new ParliamentaryFrontDomainService();

    constructor(
        @Inject(PARLIAMENTARY_FRONT_REPOSITORY)
        private readonly frontRepository: ParliamentaryFrontRepository,
        @Inject(PARLIAMENTARIAN_REPOSITORY)
        private readonly parliamentarianRepository: ParliamentarianRepository,
        @Inject(TENANT_USER_REPOSITORY)
        private readonly tenantUserRepository: TenantUserRepository,
    ) {}

    async execute(tenantId: string, dto: CreateFrenteDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        try {
            this.domainService.assertThemeProvided(dto.theme);
        } catch {
            throw new FrenteThemeRequiredError();
        }

        const startDate = dto.startDate ? new Date(dto.startDate) : null;
        const endDate = dto.endDate ? new Date(dto.endDate) : null;

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
        }

        if (dto.createdByTenantUserId) {
            const tenantUser =
                await this.tenantUserRepository.findByIdForTenant(
                    tenantId,
                    dto.createdByTenantUserId,
                );
            if (!tenantUser) {
                throw new TenantUserNotFoundForFrenteError();
            }
        }

        const front = ParliamentaryFrontEntity.create({
            tenantId,
            name: dto.name,
            theme: dto.theme,
            description: dto.description ?? null,
            startDate,
            endDate,
            status: dto.status,
            coordinatorParliamentarianId:
                dto.coordinatorParliamentarianId ?? null,
            createdByTenantUserId: dto.createdByTenantUserId ?? null,
        });

        const p = front.toPrimitives();
        const created = await this.frontRepository.create({
            tenantId: p.tenantId,
            name: p.name,
            theme: p.theme,
            description: p.description,
            startDate: p.startDate,
            endDate: p.endDate,
            status: p.status,
            coordinatorParliamentarianId: p.coordinatorParliamentarianId,
            createdByTenantUserId: p.createdByTenantUserId,
        });

        if (dto.coordinatorParliamentarianId) {
            await this.frontRepository.addMember({
                tenantId,
                frontId: created.entity.toPrimitives().id,
                parliamentarianId: dto.coordinatorParliamentarianId,
            });
            const refreshed = await this.frontRepository.findById(
                tenantId,
                created.entity.toPrimitives().id,
            );
            return FrenteViewModel.toHttp(refreshed!);
        }

        return FrenteViewModel.toHttp(created);
    }
}
