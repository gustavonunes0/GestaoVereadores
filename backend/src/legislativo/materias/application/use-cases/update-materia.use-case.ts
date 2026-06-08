import { Inject, Injectable } from '@nestjs/common';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { UpdateMateriaDto } from '../dto/update-materia.dto';
import { MatterStatusChangeViaUpdateNotAllowedError } from '../errors/matter.errors';

@Injectable()
export class UpdateMateriaUseCase {
    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    execute(tenantId: string, id: string, dto: UpdateMateriaDto) {
        if (dto.status !== undefined || dto.emTramitacao !== undefined) {
            throw new MatterStatusChangeViaUpdateNotAllowedError();
        }
        return this.repository.update(tenantId, id, dto);
    }
}
