import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { TenantPartnerEntity } from '../../domain/entities/tenant-partner.entity';
import { TenantPartnerRepository } from '../../domain/repositories/tenant-partner.repository';
import { TENANT_PARTNER_REPOSITORY } from '../../tenant-partners.tokens';
import { CreateTenantPartnerDto } from '../dto/create-tenant-partner.dto';
import { TenantPartnerViewModel } from '../view-models/tenant-partner.view-model';

@Injectable()
export class CreateTenantPartnerUseCase {
    constructor(
        @Inject(TENANT_PARTNER_REPOSITORY)
        private readonly partnerRepo: TenantPartnerRepository,
    ) {}

    async execute(tenantId: string, dto: CreateTenantPartnerDto) {
        const tipoAutorId = await this.partnerRepo.findDefaultTipoAutorId();
        if (!tipoAutorId) {
            throw new BadRequestException(
                'Tipo de autor padrão para parceiro externo não está configurado.',
            );
        }

        const partner = TenantPartnerEntity.create({
            tenantId,
            tipoAutorId,
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

        const createdPartner = await this.partnerRepo.create(partner);

        return TenantPartnerViewModel.toHttp(createdPartner, { usuarioVinculado: false });
    }
}
