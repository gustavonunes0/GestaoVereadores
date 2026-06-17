import { Inject, Injectable } from '@nestjs/common';
import { PasswordHasher } from '../../../../identidade/users/application/contracts/password-hasher';
import { PASSWORD_HASHER, USER_REPOSITORY } from '../../../../identidade/users/users.tokens';
import { UserEntity } from '../../../../identidade/users/domain/user.entity';
import { UserRepository } from '../../../../identidade/users/domain/user.repository';
import { POLITICAL_PARTY_REPOSITORY } from '../../../partidos-politicos/partidos-politicos.tokens';
import { PoliticalPartyRepository } from '../../../partidos-politicos/domain/repositories/political-party.repository';
import { ParlamentarianUserEntity } from '../../domain/entities/parlamentarian-user.entity';
import { ParliamentarianRepository } from '../../domain/repositories/parliamentarian.repository';
import { ParlamentarianUserRepository } from '../../domain/repositories/parlamentarian-user.repository';
import { ParliamentarianDomainService } from '../../domain/services/parliamentarian-domain.service';
import { ParliamentarianProvisioningDomainService } from '../../domain/services/parliamentarian-provisioning.domain-service';
import {
    PARLIAMENTARIAN_REPOSITORY,
    PARLIAMENTARIAN_USER_REPOSITORY,
} from '../../parlamentares.tokens';
import { CreateParliamentarianDto } from '../dto/create-parliamentarian.dto';
import {
    ParliamentarianCpfAlreadyInUseError,
    ParliamentarianEmailAlreadyInUseError,
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
        @Inject(PARLIAMENTARIAN_USER_REPOSITORY)
        private readonly parlamentarianUserRepository: ParlamentarianUserRepository,
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

        const saved = await this.parliamentarianRepository.create({
            tenantId,
            parliamentaryName: dto.parliamentaryName.trim(),
            officeNumber: dto.officeNumber ?? null,
            photoUrl: dto.photoUrl ?? null,
            biography: dto.biography ?? null,
        });

        if (dto.cpf && dto.password) {
            await this.provisionAccess(
                tenantId,
                saved.entity.toPrimitives().id,
                dto.cpf,
                dto.password,
                dto.parliamentaryName,
                dto.email,
                dto.politicalPartyId ?? null,
            );
            const withAccess = await this.parliamentarianRepository.findById(
                tenantId,
                saved.entity.toPrimitives().id,
            );
            if (withAccess) {
                return ParliamentarianViewModel.toHttp(withAccess);
            }
        }

        return ParliamentarianViewModel.toHttp(saved);
    }

    private async provisionAccess(
        tenantId: string,
        parliamentarianId: string,
        cpf: string,
        password: string,
        parliamentaryName: string,
        email?: string,
        politicalPartyId?: string | null,
    ) {
        const normalizedCpf = cpf.replace(/\D/g, '');
        const existingUser =
            await this.userRepository.findByCpf(normalizedCpf);
        if (existingUser) {
            throw new ParliamentarianCpfAlreadyInUseError();
        }

        const existingAccess =
            await this.parlamentarianUserRepository.findActiveByParliamentarianId(
                tenantId,
                parliamentarianId,
            );
        this.domainService.assertNoDuplicateAccess(!!existingAccess);

        const { firstName, lastName } =
            this.provisioningService.splitParliamentaryName(parliamentaryName);
        const resolvedEmail = email?.trim()
            ? email.trim().toLowerCase()
            : this.provisioningService.buildEmailFromCpf(normalizedCpf);

        const existingEmailUser =
            await this.userRepository.findByEmail(resolvedEmail);
        if (existingEmailUser) {
            throw new ParliamentarianEmailAlreadyInUseError();
        }

        const passwordHash = await this.passwordHasher.hash(password);

        const user = UserEntity.create({
            firstName,
            lastName,
            cpf: normalizedCpf,
            email: resolvedEmail,
            passwordHash,
        });
        const createdUser = await this.userRepository.create(user);

        const parlUser = ParlamentarianUserEntity.create({
            tenantId,
            parliamentarianId,
            userId: createdUser.id,
            politicalPartyId: politicalPartyId ?? null,
        });
        await this.parlamentarianUserRepository.create(parlUser);
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
