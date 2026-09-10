import { Inject, Injectable } from '@nestjs/common';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { UpdateMateriaDto } from '../dto/update-materia.dto';
import { MatterStatusChangeViaUpdateNotAllowedError } from '../errors/matter.errors';
import {
    MateriaPrismaPayload,
    MatterViewModel,
} from '../view-models/matter.view-model';
import { GenerateMateriaTextoOriginalPdfUseCase } from './generate-materia-texto-original-pdf.use-case';

const CONTENT_FIELDS: (keyof UpdateMateriaDto)[] = [
    'ementa',
    'justificativa',
    'numero',
    'anoId',
    'tipoId',
    'dataProtocolo',
];

@Injectable()
export class UpdateMateriaUseCase {
    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
        private readonly generateTextoOriginalPdf: GenerateMateriaTextoOriginalPdfUseCase,
    ) {}

    async execute(tenantId: string, id: string, dto: UpdateMateriaDto) {
        if (dto.status !== undefined || dto.emTramitacao !== undefined) {
            throw new MatterStatusChangeViaUpdateNotAllowedError();
        }

        const updated = await this.repository.update(tenantId, id, dto);
        const shouldRegen = CONTENT_FIELDS.some(
            (field) => dto[field] !== undefined,
        );

        if (shouldRegen) {
            try {
                return await this.generateTextoOriginalPdf.execute(
                    tenantId,
                    id,
                );
            } catch {
                return MatterViewModel.toHttp(
                    updated as MateriaPrismaPayload,
                );
            }
        }

        return MatterViewModel.toHttp(updated as MateriaPrismaPayload);
    }
}
