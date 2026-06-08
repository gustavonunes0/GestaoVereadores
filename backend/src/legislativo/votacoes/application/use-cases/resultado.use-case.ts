import { Inject, Injectable } from '@nestjs/common';
import {
    VOTE_RESULT_LABELS,
    VoteResult,
} from '../../domain/enums/vote-result.enum';
import { VotacaoRepository } from '../../domain/repositories/votacao.repository';
import { VOTACAO_REPOSITORY } from '../../votacoes.tokens';
import { FinalizarVotacaoDto } from '../dto/votacao.dto';
import {
    VotacaoNotFoundError,
    VotacaoPautaItemNotFoundError,
    VotacaoSessaoNotFoundError,
} from '../errors/votacao.errors';
import { ResultadoManualNaoPermitidoError } from '../errors/resultado.errors';
import {
    ResultadoVotacaoCalculado,
    ResultadoVotacaoViewModel,
} from '../view-models/resultado-votacao.view-model';

function mapRepositoryError(error: unknown): never {
    if (!(error instanceof Error)) throw error;
    const message = error.message;
    if (message.includes('Sessão plenária não encontrada')) {
        throw new VotacaoSessaoNotFoundError();
    }
    if (message.includes('Item de pauta não encontrado')) {
        throw new VotacaoPautaItemNotFoundError();
    }
    if (message.includes('Votação não encontrada')) {
        throw new VotacaoNotFoundError();
    }
    if (message.includes('calcula totais automaticamente')) {
        throw new ResultadoManualNaoPermitidoError();
    }
    throw error;
}

@Injectable()
export class PreviewResultadoVotacaoUseCase {
    constructor(
        @Inject(VOTACAO_REPOSITORY)
        private readonly repository: VotacaoRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: FinalizarVotacaoDto = {},
    ) {
        try {
            const result = (await this.repository.calcularResultadoVotacao(
                tenantId,
                sessaoId,
                pautaItemId,
                dto,
                true,
            )) as ResultadoVotacaoCalculado;
            return ResultadoVotacaoViewModel.toHttp({ ...result, preview: true });
        } catch (error) {
            mapRepositoryError(error);
        }
    }
}

@Injectable()
export class ListResultadoValoresUseCase {
    execute() {
        return {
            resultados: Object.values(VoteResult).map((value) => ({
                value,
                label: VOTE_RESULT_LABELS[value],
            })),
        };
    }
}
