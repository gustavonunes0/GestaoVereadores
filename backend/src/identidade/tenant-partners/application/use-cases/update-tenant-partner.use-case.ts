import { Inject, Injectable } from '@nestjs/common';
import { TenantPartnerRepository } from '../../domain/repositories/tenant-partner.repository';
import { TenantPartnerUserRepository } from '../../domain/repositories/tenant-partner-user.repository';
import {
    TENANT_PARTNER_REPOSITORY,
    TENANT_PARTNER_USER_REPOSITORY,
} from '../../tenant-partners.tokens';
import { UpdateTenantPartnerDto } from '../dto/update-tenant-partner.dto';
import { TenantPartnerNotFoundError } from '../errors/tenant-partner-not-found.error';
import { TenantPartnerViewModel } from '../view-models/tenant-partner.view-model';

@Injectable()
export class UpdateTenantPartnerUseCase {
    constructor(
        @Inject(TENANT_PARTNER_REPOSITORY)
        private readonly partnerRepo: TenantPartnerRepository,
        @Inject(TENANT_PARTNER_USER_REPOSITORY)
        private readonly partnerUserRepo: TenantPartnerUserRepository,
    ) {}

    async execute(tenantId: string, id: string, dto: UpdateTenantPartnerDto) {
        const partner = await this.partnerRepo.findById(tenantId, id);
        if (!partner) {
            throw new TenantPartnerNotFoundError(id);
        }

        partner.update({
            nome: dto.nome,
            cargo: dto.cargo,
            instituicao: dto.instituicao,
            cpf: dto.cpf,
            email: dto.email,
            telefone: dto.telefone,
            registro: dto.registro,
            partido: dto.partido,
            uf: dto.uf,
        });

        const updated = await this.partnerRepo.update(partner);
        const link = await this.partnerUserRepo.findByPartnerId(id);
        return TenantPartnerViewModel.toHttp(updated, {
            usuarioVinculado: !!link,
        });
    }
}
