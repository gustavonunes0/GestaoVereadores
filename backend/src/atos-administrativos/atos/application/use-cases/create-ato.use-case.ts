import { Injectable } from '@nestjs/common';
import { toOptionalDate } from '../../../../common/prisma/date-fields';
import { AtoRepository } from '../../domain/repositories/ato.repository';
import { AtoDomainService } from '../../domain/services/ato-domain.service';
import { CreateAtoDto } from '../dto/create-ato.dto';
import {
    AtoDataFinalAnteriorInicialError,
    AtoDataPublicacaoFinalAnteriorInicialError,
    AtoNumeroAlreadyInUseError,
    ClassificacaoAtoNotFoundError,
    TipoAtoNotFoundError,
} from '../errors/ato.errors';
import { AtoViewModel } from '../view-models/ato.view-model';

@Injectable()
export class CreateAtoUseCase {
    private readonly domainService = new AtoDomainService();

    constructor(private readonly atoRepository: AtoRepository) {}

    async execute(dto: CreateAtoDto) {
        const tipoExists = await this.atoRepository.existsTipoAto(dto.tipoId);
        try {
            this.domainService.assertTipoExists(tipoExists);
        } catch {
            throw new TipoAtoNotFoundError();
        }

        const classificacaoExists =
            await this.atoRepository.existsClassificacaoAto(dto.classificacaoId);
        try {
            this.domainService.assertClassificacaoExists(classificacaoExists);
        } catch {
            throw new ClassificacaoAtoNotFoundError();
        }

        const numeroExists = await this.atoRepository.existsByNumero(dto.numero);
        try {
            this.domainService.assertNumeroAvailable(numeroExists);
        } catch {
            throw new AtoNumeroAlreadyInUseError();
        }

        const dataInicio = toOptionalDate(dto.dataInicio) ?? null;
        const dataFim = toOptionalDate(dto.dataFim) ?? null;
        const dataPublicacaoInicio =
            toOptionalDate(dto.dataPublicacaoInicio) ?? null;
        const dataPublicacaoFim = toOptionalDate(dto.dataPublicacaoFim) ?? null;

        this.assertDateRanges({
            dataInicio,
            dataFim,
            dataPublicacaoInicio,
            dataPublicacaoFim,
        });

        const saved = await this.atoRepository.create({
            tipoId: dto.tipoId,
            classificacaoId: dto.classificacaoId,
            numero: dto.numero,
            dataInicio,
            dataFim,
            dataPublicacaoInicio,
            dataPublicacaoFim,
            mensagem: dto.mensagem ?? null,
        });

        return AtoViewModel.toHttp(saved);
    }

    private assertDateRanges(dates: {
        dataInicio: Date | null;
        dataFim: Date | null;
        dataPublicacaoInicio: Date | null;
        dataPublicacaoFim: Date | null;
    }) {
        try {
            this.domainService.assertVigenciaDates(
                dates.dataInicio,
                dates.dataFim,
            );
        } catch {
            throw new AtoDataFinalAnteriorInicialError();
        }

        try {
            this.domainService.assertPublicacaoDates(
                dates.dataPublicacaoInicio,
                dates.dataPublicacaoFim,
            );
        } catch {
            throw new AtoDataPublicacaoFinalAnteriorInicialError();
        }
    }
}
