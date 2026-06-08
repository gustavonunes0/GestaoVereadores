import { Inject, Injectable } from '@nestjs/common';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { LegislativeMatterDomainService } from '../../domain/services/legislative-matter-domain.service';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { CreateMateriaDto } from '../dto/materia.dto';
import { MatterEmentaRequiredError } from '../errors/matter.errors';
import {
    MateriaPrismaPayload,
    MatterViewModel,
} from '../view-models/matter.view-model';

@Injectable()
export class CreateMateriaUseCase {
    private readonly domainService = new LegislativeMatterDomainService();

    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(tenantId: string, dto: CreateMateriaDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        try {
            this.domainService.assertEmentaProvided(dto.ementa);
        } catch {
            throw new MatterEmentaRequiredError();
        }

        const created = await this.repository.create(tenantId, {
            ...dto,
            status: dto.status ?? (this.domainService.getDefaultStatus() as never),
        });

        return MatterViewModel.toHttp(created as MateriaPrismaPayload);
    }
}
