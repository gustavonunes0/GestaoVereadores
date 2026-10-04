import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    Get,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { TenantId } from '../../../../../common/decorators/tenant-id.decorator';
import { TenantMaintainer } from '../../../../../common/decorators/tenant-maintainer.decorator';
import {
    AuthenticatedUser,
    resolveTenantUserId,
} from '../../../../../common/types/authenticated-request';
import {
    CreateSubstituicaoDto,
    ListSubstituicoesQueryDto,
    SuplentesElegiveisQueryDto,
    UpdateSubstituicaoDto,
} from '../dto/substituicao.dto';
import {
    SubstituicaoNaoEditavelError,
    SubstituicaoNotFoundError,
    SubstituicaoPeriodoInvalidoError,
    SuplenteInvalidoError,
    SuplenteJaEmExercicioNoPeriodoError,
    TitularInvalidoError,
    TitularJaSubstituidoNoPeriodoError,
} from '../errors/substituicao.errors';
import { CreateSubstituicaoUseCase } from '../use-cases/create-substituicao.use-case';
import { EncerrarSubstituicaoUseCase } from '../use-cases/encerrar-substituicao.use-case';
import {
    ListSubstituicaoHistoricoUseCase,
    ListSubstituicoesUseCase,
    ListSuplentesElegiveisUseCase,
} from '../use-cases/list-substituicoes.use-case';
import { UpdateSubstituicaoUseCase } from '../use-cases/update-substituicao.use-case';

@ApiTags('legislative-substituicoes')
@ApiBearerAuth()
@Controller('legislative/substituicoes')
export class SubstituicoesController {
    constructor(
        private readonly listSubstituicoes: ListSubstituicoesUseCase,
        private readonly listHistorico: ListSubstituicaoHistoricoUseCase,
        private readonly listSuplentesElegiveis: ListSuplentesElegiveisUseCase,
        private readonly createSubstituicao: CreateSubstituicaoUseCase,
        private readonly updateSubstituicao: UpdateSubstituicaoUseCase,
        private readonly encerrarSubstituicao: EncerrarSubstituicaoUseCase,
    ) {}

    @Get()
    async list(@TenantId() tenantId: string, @Query() query: ListSubstituicoesQueryDto) {
        try {
            return await this.listSubstituicoes.execute(tenantId, query.parliamentarianId);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get('suplentes-elegiveis')
    async suplentesElegiveis(
        @TenantId() tenantId: string,
        @Query() query: SuplentesElegiveisQueryDto,
    ) {
        try {
            return await this.listSuplentesElegiveis.execute(tenantId, query.titularId);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get(':id/historico')
    async historico(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.listHistorico.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Post()
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateSubstituicaoDto,
        @Req() req: Request,
    ) {
        try {
            return await this.createSubstituicao.execute(
                tenantId,
                dto,
                resolveTenantUserId(req.user as AuthenticatedUser),
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Patch(':id')
    async update(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateSubstituicaoDto,
        @Req() req: Request,
    ) {
        try {
            return await this.updateSubstituicao.execute(
                tenantId,
                id,
                dto,
                resolveTenantUserId(req.user as AuthenticatedUser),
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Post(':id/encerrar')
    async encerrar(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: Request,
    ) {
        try {
            return await this.encerrarSubstituicao.execute(
                tenantId,
                id,
                resolveTenantUserId(req.user as AuthenticatedUser),
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        if (error instanceof SubstituicaoNotFoundError) {
            throw new NotFoundException(error.message);
        }
        if (
            error instanceof TitularJaSubstituidoNoPeriodoError ||
            error instanceof SuplenteJaEmExercicioNoPeriodoError
        ) {
            throw new ConflictException(error.message);
        }
        if (
            error instanceof TitularInvalidoError ||
            error instanceof SuplenteInvalidoError ||
            error instanceof SubstituicaoPeriodoInvalidoError ||
            error instanceof SubstituicaoNaoEditavelError
        ) {
            throw new BadRequestException(error.message);
        }
        throw error;
    }
}
