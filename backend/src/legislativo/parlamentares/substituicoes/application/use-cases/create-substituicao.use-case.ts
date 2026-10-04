import { Inject, Injectable } from '@nestjs/common';
import { CondicaoMandato } from '../../../mandatos/domain/enums/condicao-mandato.enum';
import { AcaoSubstituicaoHistorico } from '../../domain/enums/substituicao.enums';
import { SubstituicaoRepository } from '../../domain/repositories/substituicao.repository';
import { dataCivilDoInstante } from '../../domain/services/exercicio-mandato';
import { SUBSTITUICAO_REPOSITORY } from '../../substituicoes.tokens';
import { CreateSubstituicaoDto } from '../dto/substituicao.dto';
import { SuplenteInvalidoError, TitularInvalidoError } from '../errors/substituicao.errors';
import { SubstituicaoViewModel } from '../view-models/substituicao.view-model';
import { assertPeriodoDisponivel } from './substituicao-validacoes';

@Injectable()
export class CreateSubstituicaoUseCase {
    agora = () => new Date();

    constructor(
        @Inject(SUBSTITUICAO_REPOSITORY)
        private readonly repository: SubstituicaoRepository,
    ) {}

    async execute(tenantId: string, dto: CreateSubstituicaoDto, responsavelId?: string) {
        const mandatoTitular = await this.repository.findMandatoAtivo(tenantId, dto.titularId);
        if (!mandatoTitular || mandatoTitular.condicao !== CondicaoMandato.TITULAR) {
            throw new TitularInvalidoError();
        }

        const mandatoSuplente = await this.repository.findMandatoAtivo(
            tenantId,
            dto.suplenteId,
            mandatoTitular.legislatureId,
        );
        if (!mandatoSuplente || mandatoSuplente.condicao !== CondicaoMandato.SUPLENTE) {
            throw new SuplenteInvalidoError();
        }

        const dataFim = dto.dataFim ?? null;
        await assertPeriodoDisponivel(this.repository, {
            tenantId,
            titularId: dto.titularId,
            suplenteId: dto.suplenteId,
            dataInicio: dto.dataInicio,
            dataFim,
        });

        const observacao = dto.observacao?.trim() || null;
        const created = await this.repository.create(
            {
                tenantId,
                legislatureId: mandatoTitular.legislatureId,
                titularId: dto.titularId,
                suplenteId: dto.suplenteId,
                motivo: dto.motivo,
                dataInicio: dto.dataInicio,
                dataFim,
                observacao,
            },
            {
                acao: AcaoSubstituicaoHistorico.CRIADA,
                responsavelId: responsavelId ?? null,
                alteracoes: {
                    titularId: dto.titularId,
                    suplenteId: dto.suplenteId,
                    motivo: dto.motivo,
                    dataInicio: dto.dataInicio,
                    dataFim,
                    observacao,
                },
            },
            responsavelId ?? null,
        );
        return SubstituicaoViewModel.toHttp(created, dataCivilDoInstante(this.agora()));
    }
}
