import { Inject, Injectable } from '@nestjs/common';
import {
    ATTENDANCE_STATUS_LABELS,
    AttendanceStatus,
} from '../../domain/enums/attendance-status.enum';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import {
    FilterPresencaDto,
    RegistrarPresencaDto,
    UpdatePresencaDto,
} from '../dto/presenca.dto';
import {
    PresencaDuplicadaError,
    PresencaJustificativaObrigatoriaError,
    PresencaMandatoInativoError,
    PresencaNotFoundError,
    PresencaParlamentarNotFoundError,
    PresencaSessaoEncerradaError,
} from '../errors/presenca.errors';
import { SessaoPlenariaNotFoundError } from '../errors/sessao.errors';
import {
    PresencaSessaoPrismaPayload,
    PresencaSessaoViewModel,
} from '../view-models/presenca-sessao.view-model';

function mapRepositoryError(error: unknown): never {
    if (!(error instanceof Error)) throw error;
    const message = error.message;
    if (message.includes('Sessão plenária não encontrada')) {
        throw new SessaoPlenariaNotFoundError();
    }
    if (message.includes('Registro de presença não encontrado')) {
        throw new PresencaNotFoundError();
    }
    if (message.includes('Parlamentar não encontrado')) {
        throw new PresencaParlamentarNotFoundError();
    }
    if (message.includes('já possui registro de presença')) {
        throw new PresencaDuplicadaError();
    }
    if (message.includes('mandato ativo')) {
        throw new PresencaMandatoInativoError();
    }
    if (message.includes('Justificativa é obrigatória')) {
        throw new PresencaJustificativaObrigatoriaError();
    }
    if (
        message.includes('encerrada') ||
        message.includes('cancelada') ||
        message.includes('terminal')
    ) {
        throw new PresencaSessaoEncerradaError();
    }
    throw error;
}

@Injectable()
export class ListPresencasUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        filters: FilterPresencaDto,
    ) {
        try {
            const items = (await this.repository.listPresencas(
                tenantId,
                sessaoId,
                filters,
            )) as PresencaSessaoPrismaPayload[];
            return items.map((item) => PresencaSessaoViewModel.toHttp(item));
        } catch (error) {
            mapRepositoryError(error);
        }
    }
}

@Injectable()
export class GetPresencaByIdUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(tenantId: string, sessaoId: string, presencaId: string) {
        try {
            const item = (await this.repository.getPresencaById(
                tenantId,
                sessaoId,
                presencaId,
            )) as PresencaSessaoPrismaPayload;
            return PresencaSessaoViewModel.toHttp(item);
        } catch (error) {
            mapRepositoryError(error);
        }
    }
}

@Injectable()
export class RegistrarPresencaUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        dto: RegistrarPresencaDto,
    ) {
        try {
            const item = (await this.repository.registrarPresenca(
                tenantId,
                sessaoId,
                dto,
            )) as PresencaSessaoPrismaPayload;
            return PresencaSessaoViewModel.toHttp(item);
        } catch (error) {
            mapRepositoryError(error);
        }
    }
}

@Injectable()
export class UpdatePresencaUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        presencaId: string,
        dto: UpdatePresencaDto,
    ) {
        try {
            const item = (await this.repository.updatePresenca(
                tenantId,
                sessaoId,
                presencaId,
                dto,
            )) as PresencaSessaoPrismaPayload;
            return PresencaSessaoViewModel.toHttp(item);
        } catch (error) {
            mapRepositoryError(error);
        }
    }
}

@Injectable()
export class ListPresencaSituacoesUseCase {
    execute() {
        return {
            situacoes: Object.values(AttendanceStatus).map((value) => ({
                value,
                label: ATTENDANCE_STATUS_LABELS[value],
            })),
        };
    }
}
