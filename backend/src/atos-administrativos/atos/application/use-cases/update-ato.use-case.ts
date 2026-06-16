import { Injectable } from '@nestjs/common';
import { toOptionalDate } from '../../../../common/prisma/date-fields';
import { AtoEntity } from '../../domain/entities/ato.entity';
import { AtoRepository } from '../../domain/repositories/ato.repository';
import { AtoDomainService } from '../../domain/services/ato-domain.service';
import { UpdateAtoDto } from '../dto/update-ato.dto';
import {
    AtoDataFinalAnteriorInicialError,
    AtoDataPublicacaoFinalAnteriorInicialError,
    AtoNotFoundError,
    AtoNumeroAlreadyInUseError,
    ClassificacaoAtoNotFoundError,
    TipoAtoNotFoundError,
} from '../errors/ato.errors';
import { AtoViewModel } from '../view-models/ato.view-model';

@Injectable()
export class UpdateAtoUseCase {
    private readonly domainService = new AtoDomainService();

    constructor(private readonly atoRepository: AtoRepository) {}

    async execute(tenantId: string, id: string, dto: UpdateAtoDto) {
        const existing = await this.atoRepository.findById(tenantId, id);
        if (!existing) throw new AtoNotFoundError();

        if (dto.tipoId !== undefined) {
            const tipoExists = await this.atoRepository.existsTipoAto(dto.tipoId);
            try {
                this.domainService.assertTipoExists(tipoExists);
            } catch {
                throw new TipoAtoNotFoundError();
            }
        }

        if (dto.classificacaoId !== undefined) {
            const classificacaoExists = await this.atoRepository.existsClassificacaoAto(dto.classificacaoId);
            try {
                this.domainService.assertClassificacaoExists(classificacaoExists);
            } catch {
                throw new ClassificacaoAtoNotFoundError();
            }
        }

        if (dto.numero !== undefined) {
            const numeroExists = await this.atoRepository.existsByNumero(tenantId, dto.numero, id);
            try {
                this.domainService.assertNumeroAvailable(numeroExists);
            } catch {
                throw new AtoNumeroAlreadyInUseError();
            }
        }

        const resolvedDates = this.resolveDates(existing, dto);
        this.assertDateRanges(resolvedDates);

        const updated = await this.atoRepository.update(tenantId, id, {
            tipoId: dto.tipoId,
            classificacaoId: dto.classificacaoId,
            numero: dto.numero,
            dataInicio: dto.dataInicio !== undefined ? (toOptionalDate(dto.dataInicio) ?? null) : undefined,
            dataFim: dto.dataFim !== undefined ? (toOptionalDate(dto.dataFim) ?? null) : undefined,
            dataPublicacaoInicio: dto.dataPublicacaoInicio !== undefined ? (toOptionalDate(dto.dataPublicacaoInicio) ?? null) : undefined,
            dataPublicacaoFim: dto.dataPublicacaoFim !== undefined ? (toOptionalDate(dto.dataPublicacaoFim) ?? null) : undefined,
            mensagem: dto.mensagem,
            ementa: (dto as UpdateAtoDto & { ementa?: string }).ementa,
            dataAto: (dto as UpdateAtoDto & { dataAto?: string }).dataAto !== undefined
                ? (toOptionalDate((dto as UpdateAtoDto & { dataAto?: string }).dataAto) ?? null)
                : undefined,
            anexoUrl: (dto as UpdateAtoDto & { anexoUrl?: string }).anexoUrl,
            textoUrl: (dto as UpdateAtoDto & { textoUrl?: string }).textoUrl,
            identificadorId: (dto as UpdateAtoDto & { identificadorId?: string }).identificadorId,
        });

        return AtoViewModel.toHttp(updated);
    }

    private resolveDates(existing: AtoEntity, dto: UpdateAtoDto) {
        const current = existing.toPrimitives();
        return {
            dataInicio:
                dto.dataInicio !== undefined ? (toOptionalDate(dto.dataInicio) ?? null) : current.dataInicio,
            dataFim:
                dto.dataFim !== undefined ? (toOptionalDate(dto.dataFim) ?? null) : current.dataFim,
            dataPublicacaoInicio:
                dto.dataPublicacaoInicio !== undefined
                    ? (toOptionalDate(dto.dataPublicacaoInicio) ?? null)
                    : current.dataPublicacaoInicio,
            dataPublicacaoFim:
                dto.dataPublicacaoFim !== undefined
                    ? (toOptionalDate(dto.dataPublicacaoFim) ?? null)
                    : current.dataPublicacaoFim,
        };
    }

    private assertDateRanges(dates: {
        dataInicio: Date | null;
        dataFim: Date | null;
        dataPublicacaoInicio: Date | null;
        dataPublicacaoFim: Date | null;
    }) {
        try {
            this.domainService.assertVigenciaDates(dates.dataInicio, dates.dataFim);
        } catch {
            throw new AtoDataFinalAnteriorInicialError();
        }

        try {
            this.domainService.assertPublicacaoDates(dates.dataPublicacaoInicio, dates.dataPublicacaoFim);
        } catch {
            throw new AtoDataPublicacaoFinalAnteriorInicialError();
        }
    }
}
