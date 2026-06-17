import { Injectable } from '@nestjs/common';
import { toOptionalDate } from '../../../../common/prisma/date-fields';
import { NormaRepository } from '../../domain/repositories/norma.repository';
import { NormaDomainService } from '../../domain/services/norma-domain.service';
import { MateriaOrigemValidator } from '../../infra/integrations/materia-origem-validator';
import { CreateNormaDto } from '../dto/create-norma.dto';
import {
    AnoNotFoundError,
    EsferaFederacaoNotFoundError,
    IdentificadorNormaNotFoundError,
    TipoNormaNotFoundError,
} from '../errors/norma.errors';
import { NormaViewModel } from '../view-models/norma.view-model';

@Injectable()
export class CreateNormaUseCase {
    private readonly domainService = new NormaDomainService();

    constructor(
        private readonly normaRepository: NormaRepository,
        private readonly materiaOrigemValidator: MateriaOrigemValidator,
    ) {}

    async execute(tenantId: string, dto: CreateNormaDto) {
        await this.validateReferences(tenantId, dto);

        const saved = await this.normaRepository.create(tenantId, {
            tipoId: dto.tipoId,
            numero: dto.numero,
            ementa: dto.ementa,
            anoId: dto.anoId ?? null,
            data: toOptionalDate(dto.data) ?? null,
            dataPublicacaoInicio:
                toOptionalDate(dto.dataPublicacaoInicio) ?? null,
            dataPublicacaoFim: toOptionalDate(dto.dataPublicacaoFim) ?? null,
            dataPublicacao: toOptionalDate(dto.dataPublicacao) ?? null,
            esferaFederacaoId: dto.esferaFederacaoId ?? null,
            identificadorId: dto.identificadorId ?? null,
            materiaOrigemId: dto.materiaOrigemId ?? null,
            mensagem: dto.mensagem ?? null,
            complementar: dto.complementar ?? false,
            veiculoPublicacao: dto.veiculoPublicacao ?? null,
            urlExternaPublicacao: dto.urlExternaPublicacao ?? null,
            paginaInicio: dto.paginaInicio ?? null,
            paginaFim: dto.paginaFim ?? null,
        });

        return NormaViewModel.toHttp(saved);
    }

    private async validateReferences(tenantId: string, dto: CreateNormaDto) {
        const tipoExists = await this.normaRepository.existsTipoNorma(dto.tipoId);
        try {
            this.domainService.assertTipoExists(tipoExists);
        } catch {
            throw new TipoNormaNotFoundError();
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
