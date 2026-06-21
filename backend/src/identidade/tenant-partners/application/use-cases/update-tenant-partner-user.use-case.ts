import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../../users/domain/user.repository';
import { USER_REPOSITORY } from '../../../users/users.tokens';
import { PartnerUserProvisioningDomainService } from '../../domain/services/partner-user-provisioning.domain-service';
import { TenantPartnerRepository } from '../../domain/repositories/tenant-partner.repository';
import { TenantPartnerUserRepository } from '../../domain/repositories/tenant-partner-user.repository';
import {
    TENANT_PARTNER_REPOSITORY,
    TENANT_PARTNER_USER_REPOSITORY,
} from '../../tenant-partners.tokens';
import { UpdateTenantPartnerUserDto } from '../dto/update-tenant-partner-user.dto';
import { TenantPartnerNotFoundError } from '../errors/tenant-partner-not-found.error';
import { TenantPartnerUserNotFoundError } from '../errors/tenant-partner-user-not-found.error';
import { TenantPartnerViewModel } from '../view-models/tenant-partner.view-model';

@Injectable()
export class UpdateTenantPartnerUserUseCase {
    private readonly provisioning = new PartnerUserProvisioningDomainService();

    constructor(
        @Inject(TENANT_PARTNER_REPOSITORY)
        private readonly partnerRepo: TenantPartnerRepository,
        @Inject(TENANT_PARTNER_USER_REPOSITORY)
        private readonly partnerUserRepo: TenantPartnerUserRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepo: UserRepository,
    ) {}

    async execute(
        tenantId: string,
        partnerId: string,
        dto: UpdateTenantPartnerUserDto,
    ) {
        const partner = await this.partnerRepo.findById(tenantId, partnerId);
        if (!partner) {
            throw new TenantPartnerNotFoundError(partnerId);
        }

        const link = await this.partnerUserRepo.findByPartnerId(partnerId);
        if (!link || link.tenantId !== tenantId) {
            throw new TenantPartnerUserNotFoundError();
        }

        const user = await this.userRepo.findById(link.userId);
        if (!user) {
            throw new TenantPartnerUserNotFoundError();
        }

        if (dto.cpf) {
            const existingUser = await this.userRepo.findByCpf(dto.cpf);
            if (existingUser && existingUser.id !== user.id) {
                throw new ConflictException('CPF já está em uso.');
            }
        }

        if (dto.nome) {
            const { firstName, lastName } = this.provisioning.splitFullName(dto.nome);
            user.update({ firstName, lastName });
        }

        if (dto.cpf) {
            user.update({ cpf: dto.cpf });
        }

        if (dto.fotoPerfil !== undefined) {
            user.update({ profilePicture: dto.fotoPerfil || null });
        }

        const updatedUser = await this.userRepo.update(user);
        const usuario = TenantPartnerViewModel.userToHttp(updatedUser);

        return TenantPartnerViewModel.toHttp(partner, {
            usuarioVinculado: true,
            usuario,
        });
    }
}
