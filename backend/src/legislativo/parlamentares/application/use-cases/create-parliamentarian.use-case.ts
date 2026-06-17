import { Inject, Injectable } from '@nestjs/common';
import { PasswordHasher } from '../../../../identidade/users/application/contracts/password-hasher';
import { PASSWORD_HASHER, USER_REPOSITORY } from '../../../../identidade/users/users.tokens';
import { UserEntity } from '../../../../identidade/users/domain/user.entity';
import { UserRepository } from '../../../../identidade/users/domain/user.repository';
import {
    TenantUserEntity,
    TenantUserStatus,
} from '../../../../identidade/tenant-users/domain/entities/tenant-user.entity';
import { TenantUserRepository } from '../../../../identidade/tenant-users/domain/repositories/tenant-user.repository';
import { TENANT_USER_REPOSITORY } from '../../../../identidade/tenant-users/tenant-users.tokens';
import { POLITICAL_PARTY_REPOSITORY } from '../../../partidos-politicos/partidos-politicos.tokens';
import { PoliticalPartyRepository } from '../../../partidos-politicos/domain/repositories/political-party.repository';
import { ParliamentarianRepository } from '../../domain/repositories/parliamentarian.repository';
import { ParliamentarianDomainService } from '../../domain/services/parliamentarian-domain.service';
import { ParliamentarianProvisioningDomainService } from '../../domain/services/parliamentarian-provisioning.domain-service';
import { PARLIAMENTARIAN_REPOSITORY } from '../../parlamentares.tokens';
import { CreateParliamentarianDto } from '../dto/create-parliamentarian.dto';
import {
    ParliamentarianCpfAlreadyInUseError,
    PoliticalPartyNotFoundForParliamentarianError,
    PoliticalPartyRemovedForParliamentarianError,
} from '../errors/parliamentarian.errors';
import { ParliamentarianViewModel } from '../view-models/parliamentarian.view-model';

@Injectable()
export class CreateParliamentarianUseCase {
    private readonly domainService = new ParliamentarianDomainService();
    private readonly provisioningService =
        new ParliamentarianProvisioningDomainService();

    constructor(
        @Inject(PARLIAMENTARIAN_REPOSITORY)
        private readonly parliamentarianRepository: ParliamentarianRepository,
        @Inject(TENANT_USER_REPOSITORY)
        private readonly tenantUserRepository: TenantUserRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
        @Inject(POLITICAL_PARTY_REPOSITORY)
        private readonly politicalPartyRepository: PoliticalPartyRepository,
    ) {}

    async execute(tenantId: string, dto: CreateParliamentarianDto) {
        if (dto.politicalPartyId) {
            await this.assertPoliticalPartyForParliamentarian(
                tenantId,
                dto.politicalPartyId,
            );
        }

        const tenantUserId = await this.provisionTenantUser(tenantId, dto);

        const payload = {
            tenantId,
            tenantUserId,
            politicalPartyId: dto.politicalPartyId ?? null,
            parliamentaryName: dto.parliamentaryName.trim(),
            officeNumber: dto.officeNumber ?? null,
            photoUrl: dto.photoUrl ?? null,
            biography: dto.biography ?? null,
        };

        const saved = await this.parliamentarianRepository.create(payload);
        return ParliamentarianViewModel.toHttp(saved);
    }

    private async provisionTenantUser(
        tenantId: string,
        dto: CreateParliamentarianDto,
    ): Promise<string> {
        const normalizedCpf = dto.cpf.replace(/\D/g, '');
        const existingUser =
            await this.userRepository.findByCpf(normalizedCpf);
        if (existingUser) {
            throw new ParliamentarianCpfAlreadyInUseError();
        }

        const { firstName, lastName } =
            this.provisioningService.splitParliamentaryName(dto.parliamentaryName);
        const email = this.provisioningService.buildEmailFromCpf(normalizedCpf);
        const passwordHash = await this.passwordHasher.hash(dto.password);

        const user = UserEntity.create({
            firstName,
            lastName,
            cpf: normalizedCpf,
            email,
            passwordHash,
        });
        const createdUser = await this.userRepository.create(user);

        const tenantUser = TenantUserEntity.create({
            tenantId,
            userId: createdUser.id,
            isParliamentarian: true,
            status: TenantUserStatus.ACTIVE,
        });
        const createdTenantUser =
            await this.tenantUserRepository.create(tenantUser);

        return createdTenantUser.id;
    }

    private async assertPoliticalPartyForParliamentarian(
        tenantId: string,
        politicalPartyId: string,
    ) {
        const party = await this.politicalPartyRepository.findAnyById(
            tenantId,
            politicalPartyId,
        );
        try {
            this.domainService.assertPoliticalPartyUsable(party, tenantId);
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.includes('removido')
            ) {
                throw new PoliticalPartyRemovedForParliamentarianError();
            }
            throw new PoliticalPartyNotFoundForParliamentarianError();
        }
    }
}
