import { Inject, Injectable } from '@nestjs/common';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { PlenarySessionDomainService } from '../../domain/services/plenary-session-domain.service';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { CreateSessaoPlenariaDto } from '../dto/sessao.dto';
import {
    SessaoInvalidDateRangeError,
    SessaoTipoNotFoundError,
} from '../errors/sessao.errors';
import {
    SessaoPlenariaPrismaPayload,
    SessaoPlenariaViewModel,
} from '../view-models/sessao-plenaria.view-model';

@Injectable()
export class CreateSessaoPlenariaUseCase {
    private readonly domainService = new PlenarySessionDomainService();

    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(tenantId: string, dto: CreateSessaoPlenariaDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        try {
            const dataInicio = new Date(dto.dataInicio);
            const dataFim = dto.dataFim ? new Date(dto.dataFim) : null;
            this.domainService.assertDateRange(dataInicio, dataFim);
        } catch {
            throw new SessaoInvalidDateRangeError();
        }

        try {
            const created = await this.repository.create(tenantId, dto);
            return SessaoPlenariaViewModel.toHttp(
                created as SessaoPlenariaPrismaPayload,
            );
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.includes('Tipo de sessão não encontrado')
            ) {
                throw new SessaoTipoNotFoundError();
            }
            throw error;
        }
    }
}
