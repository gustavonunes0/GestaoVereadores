import { Inject, Injectable } from '@nestjs/common';
import {
    AcaoSubstituicaoHistorico,
    StatusSubstituicao,
} from '../../domain/enums/substituicao.enums';
import {
    AtualizarSubstituicaoDados,
    SubstituicaoRepository,
} from '../../domain/repositories/substituicao.repository';
import { dataCivilDoInstante } from '../../domain/services/exercicio-mandato';
import { SUBSTITUICAO_REPOSITORY } from '../../substituicoes.tokens';
import { UpdateSubstituicaoDto } from '../dto/substituicao.dto';
import {
    SubstituicaoNaoEditavelError,
    SubstituicaoNotFoundError,
} from '../errors/substituicao.errors';
import { SubstituicaoViewModel } from '../view-models/substituicao.view-model';
import { assertPeriodoDisponivel } from './substituicao-validacoes';

@Injectable()
export class UpdateSubstituicaoUseCase {
    agora = () => new Date();

    constructor(
        @Inject(SUBSTITUICAO_REPOSITORY)
        private readonly repository: SubstituicaoRepository,
    ) {}

    async execute(
        tenantId: string,
        id: string,
        dto: UpdateSubstituicaoDto,
        responsavelId?: string,
    ) {
        const atual = await this.repository.findById(tenantId, id);
        if (!atual) throw new SubstituicaoNotFoundError();
        if (atual.status !== StatusSubstituicao.ATIVA) {
            throw new SubstituicaoNaoEditavelError();
        }

        const hoje = dataCivilDoInstante(this.agora());
        const novo = {
            dataInicio: dto.dataInicio ?? atual.dataInicio,
            dataFim: dto.dataFim !== undefined ? dto.dataFim : atual.dataFim,
            observacao:
                dto.observacao !== undefined ? dto.observacao?.trim() || null : atual.observacao,
        };

        const alteracoes: Record<string, { antes: unknown; depois: unknown }> = {};
        for (const campo of ['dataInicio', 'dataFim', 'observacao'] as const) {
            if (novo[campo] !== atual[campo]) {
                alteracoes[campo] = { antes: atual[campo], depois: novo[campo] };
            }
        }
        if (Object.keys(alteracoes).length === 0) {
            return SubstituicaoViewModel.toHttp(atual, hoje);
        }

        await assertPeriodoDisponivel(this.repository, {
            tenantId,
            titularId: atual.titularId,
            suplenteId: atual.suplenteId,
            dataInicio: novo.dataInicio,
            dataFim: novo.dataFim,
            excetoId: atual.id,
        });

        const dados: AtualizarSubstituicaoDados = {};
        if (alteracoes.dataInicio) dados.dataInicio = novo.dataInicio;
        if (alteracoes.dataFim) dados.dataFim = novo.dataFim;
        if (alteracoes.observacao) dados.observacao = novo.observacao;

        const saved = await this.repository.update(tenantId, id, dados, {
            acao: AcaoSubstituicaoHistorico.DATAS_ALTERADAS,
            responsavelId: responsavelId ?? null,
            alteracoes,
        });
        return SubstituicaoViewModel.toHttp(saved, hoje);
    }
}
