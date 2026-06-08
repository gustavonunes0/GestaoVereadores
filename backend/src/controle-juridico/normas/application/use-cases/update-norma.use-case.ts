import { Injectable } from '@nestjs/common';
import { toOptionalDate } from '../../../../common/prisma/date-fields';
import { NormaRepository } from '../../domain/repositories/norma.repository';
import { NormaDomainService } from '../../domain/services/norma-domain.service';
import { MateriaOrigemValidator } from '../../infra/integrations/materia-origem-validator';
import { UpdateNormaDto } from '../dto/update-norma.dto';
import {
    AnoNotFoundError,
    EsferaFederacaoNotFoundError,
    IdentificadorNormaNotFoundError,
    NormaNotFoundError,
    TipoNormaNotFoundError,
} from '../errors/norma.errors';
import { NormaViewModel } from '../view-models/norma.view-model';

@Injectable()
export class UpdateNormaUseCase {
    private readonly domainService = new NormaDomainService();

    constructor(
        private readonly normaRepository: NormaRepository,
        private readonly materiaOrigemValidator: MateriaOrigemValidator,
    ) {}

    async execute(tenantId: string, id: string, dto: UpdateNormaDto) {
        const existing = await this.normaRepository.findById(tenantId, id);
        if (!existing) throw new NormaNotFoundError();

        await this.validateReferences(tenantId, dto);

        const updated = await this.normaRepository.update(tenantId, id, {
            tipoId: dto.tipoId,
            numero: dto.numero,
            ementa: dto.ementa,
            anoId: dto.anoId,
            data:
                dto.data !== undefined
                    ? (toOptionalDate(dto.data) ?? null)
                    : undefined,
            dataPublicacaoInicio:
                dto.dataPublicacaoInicio !== undefined
                    ? (toOptionalDate(dto.dataPublicacaoInicio) ?? null)
                    : undefined,
            dataPublicacaoFim:
                dto.dataPublicacaoFim !== undefined
                    ? (toOptionalDate(dto.dataPublicacaoFim) ?? null)
                    : undefined,
            esferaFederacaoId: dto.esferaFederacaoId,
            identificadorId: dto.identificadorId,
            materiaOrigemId: dto.materiaOrigemId,
            mensagem: dto.mensagem,
        });

        return NormaViewModel.toHttp(updated);
    }

    private async validateReferences(tenantId: string, dto: UpdateNormaDto) {
        if (dto.tipoId !== undefined) {
            const tipoExists = await this.normaRepository.existsTipoNorma(
                dto.tipoId,
            );
            try {
                this.domainService.assertTipoExists(tipoExists);
            } catch {
                throw new TipoNormaNotFoundError();
            }
        }

        if (dto.anoId) {
            const anoExists = await this.normaRepository.existsAno(dto.anoId);
            try {
                this.domainService.assertAnoExists(anoExists);
            } catch {
                throw new AnoNotFoundError();
            }
        }

        if (dto.esferaFederacaoId) {
            const exists = await this.normaRepository.existsEsferaFederacao(
                dto.esferaFederacaoId,
            );
            try {
                this.domainService.assertEsferaExists(exists);
            } catch {
                throw new EsferaFederacaoNotFoundError();
            }
        }

        if (dto.identificadorId) {
            const exists = await this.normaRepository.existsIdentificadorNorma(
                dto.identificadorId,
            );
            try {
                this.domainService.assertIdentificadorExists(exists);
            } catch {
                throw new IdentificadorNormaNotFoundError();
            }
        }

        if (dto.materiaOrigemId) {
            await this.materiaOrigemValidator.validate(
                tenantId,
                dto.materiaOrigemId,
            );
        }
    }
}
