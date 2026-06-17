import { Inject, Injectable } from '@nestjs/common';
import {
    AuthenticatedUser,
    isParlamentarianUser,
} from '../../../../common/types/authenticated-request';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { LegislativeMatterDomainService } from '../../domain/services/legislative-matter-domain.service';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { CreateMateriaDto } from '../dto/materia.dto';
import {
    MatterAuthorshipValidationError,
    MatterEmentaRequiredError,
} from '../errors/matter.errors';
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

    async execute(
        tenantId: string,
        dto: CreateMateriaDto,
        user?: AuthenticatedUser,
    ) {
        this.domainService.assertTenantIdProvided(tenantId);

        try {
            this.domainService.assertEmentaProvided(dto.ementa);
        } catch {
            throw new MatterEmentaRequiredError();
        }

        const {
            autorExternoId,
            authorParliamentarianId: dtoAuthorParliamentarianId,
            coautorIds,
            relatoresIds,
            ...createDto
        } = dto;

        let authorParliamentarianId = dtoAuthorParliamentarianId;

        if (user && isParlamentarianUser(user)) {
            authorParliamentarianId = user.parliamentarianId;
        }

        if (!authorParliamentarianId && !autorExternoId) {
            throw new MatterAuthorshipValidationError('Autor é obrigatório');
        }

        if (authorParliamentarianId && autorExternoId) {
            throw new MatterAuthorshipValidationError(
                'Informe apenas um tipo de autor por matéria',
            );
        }

        const created = (await this.repository.create(tenantId, {
            ...createDto,
            status:
                dto.status ??
                (this.domainService.getDefaultStatus() as never),
        })) as { id: string };

        if (authorParliamentarianId) {
            await this.repository.setAutorParlamentar(tenantId, created.id, {
                parliamentarianId: authorParliamentarianId,
            });
        } else if (autorExternoId) {
            await this.repository.setAutorExterno(tenantId, created.id, {
                autorExternoId,
            });
        }

        if (coautorIds?.length) {
            await this.repository.replaceCoautores(
                tenantId,
                created.id,
                coautorIds,
            );
        }

        if (relatoresIds?.[0]) {
            await this.repository.setRelator(tenantId, created.id, {
                parliamentarianId: relatoresIds[0],
            });
        }

        const full = await this.repository.findOne(tenantId, created.id);
        return MatterViewModel.toHttp(full as MateriaPrismaPayload);
    }
}
