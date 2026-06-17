import { Inject, Injectable } from '@nestjs/common';
import { PasswordHasher } from '../../../../identidade/users/application/contracts/password-hasher';
import { PASSWORD_HASHER, USER_REPOSITORY } from '../../../../identidade/users/users.tokens';
import { UserEntity } from '../../../../identidade/users/domain/user.entity';
import { UserRepository } from '../../../../identidade/users/domain/user.repository';
import { ParlamentarianUserEntity } from '../../domain/entities/parlamentarian-user.entity';
import { ParliamentarianRepository } from '../../domain/repositories/parliamentarian.repository';
import { ParlamentarianUserRepository } from '../../domain/repositories/parlamentarian-user.repository';
import { ParliamentarianDomainService } from '../../domain/services/parliamentarian-domain.service';
import { ParliamentarianProvisioningDomainService } from '../../domain/services/parliamentarian-provisioning.domain-service';
import {
    PARLIAMENTARIAN_REPOSITORY,
    PARLIAMENTARIAN_USER_REPOSITORY,
} from '../../parlamentares.tokens';
import { GrantParliamentarianAccessDto } from '../dto/grant-parliamentarian-access.dto';
import {
    ParliamentarianAccessAlreadyGrantedError,
} from '../errors/parliamentarian-access.errors';
import {
    ParliamentarianCpfAlreadyInUseError,
    ParliamentarianNotFoundError,
} from '../errors/parliamentarian.errors';

@Injectable()
export class GrantParliamentarianAccessUseCase {
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
    ) {}

    async execute(
        tenantId: string,
        parliamentarianId: string,
        dto: GrantParliamentarianAccessDto,
    ) {
        const parliamentarian = await this.parliamentarianRepository.findById(
            tenantId,
            parliamentarianId,
        );
        if (!parliamentarian) {
            throw new ParliamentarianNotFoundError();
        }

        const existing =
            await this.parlamentarianUserRepository.findActiveByParliamentarianId(
                tenantId,
                parliamentarianId,
            );
        try {
            this.domainService.assertNoDuplicateAccess(!!existing);
        } catch {
            throw new ParliamentarianAccessAlreadyGrantedError();
        }

        let userId = dto.userId;
        if (!userId) {
            if (!dto.cpf || !dto.password) {
                throw new Error('Informe userId ou CPF com senha');
            }
            userId = await this.createUserForAccess(
                dto.cpf,
                dto.password,
                dto.parliamentaryName ??
                    parliamentarian.entity.toPrimitives().parliamentaryName,
            );
        }

        const existingUserAccess =
            await this.parlamentarianUserRepository.findActiveByUserId(
                tenantId,
                userId,
            );
        if (existingUserAccess) {
            throw new ParliamentarianAccessAlreadyGrantedError();
        }

        const parlUser = ParlamentarianUserEntity.create({
            tenantId,
            parliamentarianId,
            userId,
        });
        await this.parlamentarianUserRepository.create(parlUser);

        const updated = await this.parliamentarianRepository.findById(
            tenantId,
            parliamentarianId,
        );
        if (!updated) {
            throw new ParliamentarianNotFoundError();
        }
        return updated;
    }

    private async createUserForAccess(
        cpf: string,
        password: string,
        parliamentaryName: string,
    ) {
        const normalizedCpf = cpf.replace(/\D/g, '');
        const existingUser =
            await this.userRepository.findByCpf(normalizedCpf);
        if (existingUser) {
            throw new ParliamentarianCpfAlreadyInUseError();
        }

        const { firstName, lastName } =
            this.provisioningService.splitParliamentaryName(parliamentaryName);
        const email = this.provisioningService.buildEmailFromCpf(normalizedCpf);
        const passwordHash = await this.passwordHasher.hash(password);

        const user = UserEntity.create({
            firstName,
            lastName,
            cpf: normalizedCpf,
            email,
            passwordHash,
        });
        const createdUser = await this.userRepository.create(user);
        return createdUser.id;
    }
}
