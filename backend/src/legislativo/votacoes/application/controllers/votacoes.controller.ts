import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
    ListResultadoValoresUseCase,
} from '../use-cases/resultado.use-case';
import { ListVotacaoTiposUseCase } from '../use-cases/votacao.use-case';
import { ListVotoValoresUseCase } from '../use-cases/voto.use-case';
import { EncerrarVotacaoUseCase } from '../use-cases/encerrar-votacao.use-case';
import { EncerrarVotacaoDto } from '../dto/encerrar-votacao.dto';
import { TenantId } from '../../../../common/decorators/tenant-id.decorator';
import { TenantRoles } from '../../../../common/decorators/tenant-roles.decorator';
import { STAFF_AND_ABOVE } from '../../../../auth/guards/guard-combos';

@ApiTags('votacoes')
@ApiBearerAuth()
@Controller('legislative/votacoes')
export class VotacoesController {
    constructor(
        private readonly listVotacaoTipos: ListVotacaoTiposUseCase,
        private readonly listVotoValores: ListVotoValoresUseCase,
        private readonly listResultadoValores: ListResultadoValoresUseCase,
        private readonly encerrarVotacao: EncerrarVotacaoUseCase,
    ) {}

    @Get('tipos')
    listTipos() {
        return this.listVotacaoTipos.execute();
    }

    @Get('votos/valores')
    listValoresVoto() {
        return this.listVotoValores.execute();
    }

    @Get('resultados/valores')
    listValoresResultado() {
        return this.listResultadoValores.execute();
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Post(':id/encerrar')
    encerrar(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: EncerrarVotacaoDto,
        @Req() req: Request,
    ) {
        const responsavelId = (req.user as { id?: string })?.id ?? 'system';
        return this.encerrarVotacao.execute(tenantId, id, dto, responsavelId);
    }
}
