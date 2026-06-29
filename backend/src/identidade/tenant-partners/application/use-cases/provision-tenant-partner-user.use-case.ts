import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PasswordHasher } from '../../../users/application/contracts/password-hasher';
import { PASSWORD_HASHER } from '../../../users/users.tokens';
import { UserEntity } from '../../../users/domain/user.entity';
import { UserRepository } from '../../../users/domain/user.repository';
import { USER_REPOSITORY } from '../../../users/users.tokens';
import { TenantPartnerUserEntity } from '../../domain/entities/tenant-partner-user.entity';
import { PartnerCredentialsService } from '../../domain/services/partner-credentials.service';
import { PartnerUserProvisioningDomainService } from '../../domain/services/partner-user-provisioning.domain-service';
import { TenantPartnerRepository } from '../../domain/repositories/tenant-partner.repository';
import { TenantPartnerUserRepository } from '../../domain/repositories/tenant-partner-user.repository';
import {
    TENANT_PARTNER_REPOSITORY,
    TENANT_PARTNER_USER_REPOSITORY,
} from '../../tenant-partners.tokens';
import { ProvisionTenantPartnerUserDto } from '../dto/provision-tenant-partner-user.dto';
import { TenantPartnerNotFoundError } from '../errors/tenant-partner-not-found.error';
import { TenantPartnerUserAlreadyExistsError } from '../errors/tenant-partner-user-already-exists.error';
import { TenantPartnerViewModel } from '../view-models/tenant-partner.view-model';

@Injectable()
export class ProvisionTenantPartnerUserUseCase {
    private readonly credentials = new PartnerCredentialsService();
    private readonly provisioning = new PartnerUserProvisioningDomainService();

    constructor(
        @Inject(TENANT_PARTNER_REPOSITORY)
        private readonly partnerRepo: TenantPartnerRepository,
        @Inject(TENANT_PARTNER_USER_REPOSITORY)
        private readonly partnerUserRepo: TenantPartnerUserRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepo: UserRepository,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
    ) {}

    async execute(
        tenantId: string,
        partnerId: string,
        dto: ProvisionTenantPartnerUserDto,
    ) {
        const partner = await this.partnerRepo.findById(tenantId, partnerId);
        if (!partner) {
            throw new TenantPartnerNotFoundError(partnerId);
        }

        const existingLink = await this.partnerUserRepo.findByPartnerId(partnerId);
        if (existingLink) {
            throw new TenantPartnerUserAlreadyExistsError();
        }

        const normalizedCpf = dto.cpf.replace(/\D/g, '');

        const existingUser = await this.userRepo.findByCpf(normalizedCpf);
        if (existingUser) {
            throw new ConflictException('CPF já está em uso.');
        }

        const resolvedEmail = this.credentials.generatePlaceholderEmail();
        const existingEmailUser = await this.userRepo.findByEmail(resolvedEmail);
        if (existingEmailUser) {
            throw new ConflictException('Não foi possível gerar e-mail interno único.');
        }

        const plainPassword = this.credentials.generateRandomPassword();
        const passwordHash = await this.passwordHasher.hash(plainPassword);

        const { firstName, lastName } = this.provisioning.splitFullName(dto.nome);

        const user = UserEntity.create({
            id: randomUUID(),
            firstName,
            lastName,
            cpf: normalizedCpf,
            email: resolvedEmail,
            passwordHash,
            profilePicture: dto.fotoPerfil,
        });

        const createdUser = await this.userRepo.create(user);

        const partnerUser = TenantPartnerUserEntity.create({
            tenantId,
            tenantPartnerId: partnerId,
            userId: createdUser.id,
        });

        await this.partnerUserRepo.create(partnerUser);

        const usuario = TenantPartnerViewModel.userToHttp(createdUser);

        return TenantPartnerViewModel.toHttp(partner, {
            usuarioVinculado: true,
            usuario,
        });
    }
}
