import { Inject, Injectable } from '@nestjs/common';
import { VoteValue, VOTE_VALUE_LABELS } from '../../domain/enums/vote-value.enum';
import { VotacaoRepository } from '../../domain/repositories/votacao.repository';
import { VOTACAO_REPOSITORY } from '../../votacoes.tokens';
import {
    FilterVotoDto,
    RegistrarVotoDto,
    UpdateVotoDto,
} from '../dto/voto.dto';
import {
    VotacaoNotFoundError,
    VotacaoSessaoNotFoundError,
    VotacaoTipoSimbolicaError,
} from '../errors/votacao.errors';
import {
    VotoDuplicadoError,
    VotoMandatoInativoError,
    VotoNotFoundError,
    VotoParlamentarAusenteError,
    VotoParlamentarNotFoundError,
    VotoVotacaoEncerradaError,
} from '../errors/voto.errors';
import {
    VotoParlamentarPrismaPayload,
    VotoParlamentarViewModel,
} from '../view-models/voto-parlamentar.view-model';

function mapRepositoryError(error: unknown): never {
    if (!(error instanceof Error)) throw error;
    const message = error.message;
    if (message.includes('Sessão plenária não encontrada')) {
        throw new VotacaoSessaoNotFoundError();
    }
    if (message.includes('Votação não encontrada')) {
        throw new VotacaoNotFoundError();
    }
    if (message.includes('Voto parlamentar não encontrado')) {
        throw new VotoNotFoundError();
    }
    if (message.includes('já registrou voto')) {
        throw new VotoDuplicadoError();
    }
    if (message.includes('mandato ativo')) {
        throw new VotoMandatoInativoError();
    }
    if (message.includes('Parlamentar não encontrado')) {
        throw new VotoParlamentarNotFoundError();
    }
    if (message.includes('parlamentares presentes')) {
        throw new VotoParlamentarAusenteError();
    }
    if (message.includes('Votação já foi finalizada')) {
        throw new VotoVotacaoEncerradaError();
    }
    if (message.includes('simbólica não registra voto')) {
        throw new VotacaoTipoSimbolicaError();
    }
    throw error;
}

@Injectable()
export class ListVotosUseCase {
    constructor(
        @Inject(VOTACAO_REPOSITORY)
        private readonly repository: VotacaoRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        filters: FilterVotoDto,
    ) {
        try {
            const votos = (await this.repository.listVotos(
                tenantId,
                sessaoId,
                pautaItemId,
                filters,
            )) as VotoParlamentarPrismaPayload[];
            return votos.map((voto) => VotoParlamentarViewModel.toHttp(voto));
        } catch (error) {
            mapRepositoryError(error);
        }
    }
}

@Injectable()
export class GetVotoByIdUseCase {
    constructor(
        @Inject(VOTACAO_REPOSITORY)
        private readonly repository: VotacaoRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        votoId: string,
    ) {
        try {
            const voto = (await this.repository.getVotoById(
                tenantId,
                sessaoId,
                pautaItemId,
                votoId,
            )) as VotoParlamentarPrismaPayload;
            return VotoParlamentarViewModel.toHttp(voto);
        } catch (error) {
            mapRepositoryError(error);
        }
    }
}

@Injectable()
export class RegistrarVotoUseCase {
    constructor(
        @Inject(VOTACAO_REPOSITORY)
        private readonly repository: VotacaoRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: RegistrarVotoDto,
    ) {
        try {
            const voto = (await this.repository.registrarVoto(
                tenantId,
                sessaoId,
                pautaItemId,
                dto,
            )) as VotoParlamentarPrismaPayload;
            return VotoParlamentarViewModel.toHttp(voto);
        } catch (error) {
            mapRepositoryError(error);
        }
    }
}

@Injectable()
export class UpdateVotoUseCase {
    constructor(
        @Inject(VOTACAO_REPOSITORY)
        private readonly repository: VotacaoRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        votoId: string,
        dto: UpdateVotoDto,
    ) {
        try {
            const voto = (await this.repository.updateVoto(
                tenantId,
                sessaoId,
                pautaItemId,
                votoId,
                dto,
            )) as VotoParlamentarPrismaPayload;
            return VotoParlamentarViewModel.toHttp(voto);
        } catch (error) {
            mapRepositoryError(error);
        }
    }
}

@Injectable()
export class ListVotoValoresUseCase {
    execute() {
        return {
            valores: Object.values(VoteValue).map((value) => ({
                value,
                label: VOTE_VALUE_LABELS[value],
            })),
        };
    }
}
