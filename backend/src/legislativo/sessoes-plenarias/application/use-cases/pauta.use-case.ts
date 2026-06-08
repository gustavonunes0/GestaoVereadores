import { Inject, Injectable } from '@nestjs/common';
import {
    AGENDA_PHASE_LABELS,
    AgendaPhase,
} from '../../domain/enums/agenda-phase.enum';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { FilterPautaDto, UpdatePautaItemDto } from '../dto/pauta.dto';
import { AddPautaItemDto } from '../dto/sessao.dto';
import {
    PautaItemComVotacaoAbertaError,
    PautaItemNotFoundError,
    PautaMateriaDuplicadaError,
    PautaMateriaNotFoundError,
    PautaOrdemEmUsoError,
    PautaSessaoNaoAceitaAlteracaoError,
} from '../errors/pauta.errors';
import { SessaoPlenariaNotFoundError } from '../errors/sessao.errors';
import {
    PautaItemPrismaPayload,
    PautaItemViewModel,
} from '../view-models/pauta-item.view-model';

function mapRepositoryError(error: unknown): never {
    if (!(error instanceof Error)) throw error;
    const message = error.message;
    if (message.includes('Sessão plenária não encontrada')) {
        throw new SessaoPlenariaNotFoundError();
    }
    if (message.includes('Item de pauta não encontrado')) {
        throw new PautaItemNotFoundError();
    }
    if (message.includes('Matéria não encontrada')) {
        throw new PautaMateriaNotFoundError();
    }
    if (message.includes('EM_ANDAMENTO')) {
        throw new PautaSessaoNaoAceitaAlteracaoError();
    }
    if (message.includes('já consta na pauta')) {
        throw new PautaMateriaDuplicadaError();
    }
    if (message.includes('já está em uso')) {
        const match = message.match(/Ordem (\d+)/);
        throw new PautaOrdemEmUsoError(match ? Number(match[1]) : 0);
    }
    if (message.includes('votação em andamento')) {
        throw new PautaItemComVotacaoAbertaError();
    }
    throw error;
}

@Injectable()
export class ListPautaItensUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        filters: FilterPautaDto,
    ) {
        try {
            const items = (await this.repository.listPautaItens(
                tenantId,
                sessaoId,
                filters,
            )) as PautaItemPrismaPayload[];
            return items.map((item) => PautaItemViewModel.toHttp(item));
        } catch (error) {
            mapRepositoryError(error);
        }
    }
}

@Injectable()
export class GetPautaItemByIdUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(tenantId: string, sessaoId: string, pautaItemId: string) {
        try {
            const item = (await this.repository.getPautaItemById(
                tenantId,
                sessaoId,
                pautaItemId,
            )) as PautaItemPrismaPayload;
            return PautaItemViewModel.toHttp(item);
        } catch (error) {
            mapRepositoryError(error);
        }
    }
}

@Injectable()
export class AddPautaItemUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(tenantId: string, sessaoId: string, dto: AddPautaItemDto) {
        try {
            const item = (await this.repository.addPautaItem(
                tenantId,
                sessaoId,
                dto,
            )) as PautaItemPrismaPayload;
            return PautaItemViewModel.toHttp(item);
        } catch (error) {
            mapRepositoryError(error);
        }
    }
}

@Injectable()
export class UpdatePautaItemUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: UpdatePautaItemDto,
    ) {
        try {
            const item = (await this.repository.updatePautaItem(
                tenantId,
                sessaoId,
                pautaItemId,
                dto,
            )) as PautaItemPrismaPayload;
            return PautaItemViewModel.toHttp(item);
        } catch (error) {
            mapRepositoryError(error);
        }
    }
}

@Injectable()
export class RemovePautaItemUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(tenantId: string, sessaoId: string, pautaItemId: string) {
        try {
            const item = (await this.repository.removerPautaItem(
                tenantId,
                sessaoId,
                pautaItemId,
            )) as PautaItemPrismaPayload;
            return PautaItemViewModel.toHttp(item);
        } catch (error) {
            mapRepositoryError(error);
        }
    }
}

@Injectable()
export class ListPautaFasesUseCase {
    execute() {
        return {
            fases: Object.values(AgendaPhase).map((value) => ({
                value,
                label: AGENDA_PHASE_LABELS[value],
            })),
        };
    }
}
