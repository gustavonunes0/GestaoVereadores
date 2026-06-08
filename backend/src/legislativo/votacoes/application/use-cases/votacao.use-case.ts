import { Inject, Injectable } from '@nestjs/common';
import { VoteType, VOTE_TYPE_LABELS } from '../../domain/enums/vote-type.enum';
import { VotacaoRepository } from '../../domain/repositories/votacao.repository';
import { VOTACAO_REPOSITORY } from '../../votacoes.tokens';
import {
    AbrirVotacaoDto,
    FinalizarVotacaoDto,
} from '../dto/votacao.dto';
import { ResultadoManualNaoPermitidoError } from '../errors/resultado.errors';
import {
    VotacaoJaExisteError,
    VotacaoJaFinalizadaError,
    VotacaoMateriaNaoNaPautaError,
    VotacaoMateriaNotFoundError,
    VotacaoNotFoundError,
    VotacaoParlamentarNotFoundError,
    VotacaoPautaItemNotFoundError,
    VotacaoQuorumNaoAtingidoError,
    VotacaoSessaoInvalidaError,
    VotacaoSessaoNotFoundError,
    VotacaoTipoSimbolicaError,
    VotacaoTotaisSimbolicaObrigatoriosError,
} from '../errors/votacao.errors';
import {
    VotacaoPrismaPayload,
    VotacaoViewModel,
} from '../view-models/votacao.view-model';

function mapRepositoryError(error: unknown): never {
    if (!(error instanceof Error)) throw error;
    const message = error.message;
    if (message.includes('Sessão plenária não encontrada')) {
        throw new VotacaoSessaoNotFoundError();
    }
    if (message.includes('Item de pauta não encontrado')) {
        throw new VotacaoPautaItemNotFoundError();
    }
    if (message.includes('Matéria não encontrada')) {
        throw new VotacaoMateriaNotFoundError();
    }
    if (message.includes('Matéria precisa estar na pauta')) {
        throw new VotacaoMateriaNaoNaPautaError();
    }
    if (message.includes('EM_ANDAMENTO')) {
        throw new VotacaoSessaoInvalidaError();
    }
    if (message.includes('Votação não encontrada')) {
        throw new VotacaoNotFoundError();
    }
    if (message.includes('votação principal')) {
        throw new VotacaoJaExisteError();
    }
    if (message.includes('Votação já foi finalizada')) {
        throw new VotacaoJaFinalizadaError();
    }
    if (message.includes('Quorum não atingido')) {
        throw new VotacaoQuorumNaoAtingidoError(message);
    }
    if (message.includes('simbólica não registra voto')) {
        throw new VotacaoTipoSimbolicaError();
    }
    if (message.includes('exige votosSim e votosNao')) {
        throw new VotacaoTotaisSimbolicaObrigatoriosError();
    }
    if (message.includes('calcula totais automaticamente')) {
        throw new ResultadoManualNaoPermitidoError();
    }
    if (message.includes('Parlamentar não encontrado')) {
        throw new VotacaoParlamentarNotFoundError();
    }
    throw error;
}

@Injectable()
export class AbrirVotacaoUseCase {
    constructor(
        @Inject(VOTACAO_REPOSITORY)
        private readonly repository: VotacaoRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: AbrirVotacaoDto,
    ) {
        try {
            const votacao = (await this.repository.abrirVotacao(
                tenantId,
                sessaoId,
                pautaItemId,
                dto,
            )) as VotacaoPrismaPayload;
            return VotacaoViewModel.toHttp(votacao);
        } catch (error) {
            mapRepositoryError(error);
        }
    }
}

@Injectable()
export class ObterVotacaoUseCase {
    constructor(
        @Inject(VOTACAO_REPOSITORY)
        private readonly repository: VotacaoRepository,
    ) {}

    async execute(tenantId: string, sessaoId: string, pautaItemId: string) {
        try {
            const votacao = (await this.repository.obterVotacao(
                tenantId,
                sessaoId,
                pautaItemId,
            )) as VotacaoPrismaPayload;
            return VotacaoViewModel.toHttp(votacao);
        } catch (error) {
            mapRepositoryError(error);
        }
    }
}

@Injectable()
export class FinalizarVotacaoUseCase {
    constructor(
        @Inject(VOTACAO_REPOSITORY)
        private readonly repository: VotacaoRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: FinalizarVotacaoDto,
    ) {
        try {
            const votacao = (await this.repository.finalizarVotacao(
                tenantId,
                sessaoId,
                pautaItemId,
                dto,
            )) as VotacaoPrismaPayload;
            return VotacaoViewModel.toHttp(votacao!);
        } catch (error) {
            mapRepositoryError(error);
        }
    }
}

@Injectable()
export class ListVotacaoTiposUseCase {
    execute() {
        return {
            tipos: Object.values(VoteType).map((value) => ({
                value,
                label: VOTE_TYPE_LABELS[value],
            })),
        };
    }
}
