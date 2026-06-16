import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../auth/decorators/public.decorator';
import { TenantRoles } from '../../../../common/decorators/tenant-roles.decorator';
import { TenantId } from '../../../../common/decorators/tenant-id.decorator';
import { ADMIN_ONLY, STAFF_AND_ABOVE } from '../../../../auth/guards/guard-combos';
import {
    RegistrarPromulgacaoDto,
    RegistrarPublicacaoDto,
    RegistrarSancaoDto,
    RegistrarVetoDto,
    RevogarNormaDto,
} from '../dto/ciclo-juridico.dto';
import { CreateNormaDto } from '../dto/create-norma.dto';
import { ListNormasQueryDto } from '../dto/list-normas-query.dto';
import { UpdateNormaDto } from '../dto/update-norma.dto';
import {
    AnoNotFoundError,
    EsferaFederacaoNotFoundError,
    IdentificadorNormaNotFoundError,
    MateriaNaoPodeGerarNormaError,
    MateriaOrigemNotFoundError,
    NormaNotFoundError,
    TipoNormaNotFoundError,
} from '../errors/norma.errors';
import { CreateNormaUseCase } from '../use-cases/create-norma.use-case';
import { GetNormaByIdUseCase } from '../use-cases/get-norma-by-id.use-case';
import { ListNormasUseCase } from '../use-cases/list-normas.use-case';
import { ListPublicNormasUseCase } from '../use-cases/list-public-normas.use-case';
import { RegistrarPromulgacaoUseCase } from '../use-cases/registrar-promulgacao.use-case';
import { RegistrarPublicacaoUseCase } from '../use-cases/registrar-publicacao.use-case';
import { RegistrarSancaoUseCase } from '../use-cases/registrar-sancao.use-case';
import { RegistrarVetoUseCase } from '../use-cases/registrar-veto.use-case';
import { RemoveNormaUseCase } from '../use-cases/remove-norma.use-case';
import { RevogarNormaUseCase } from '../use-cases/revogar-norma.use-case';
import { UpdateNormaUseCase } from '../use-cases/update-norma.use-case';

@ApiTags('normas')
@ApiBearerAuth()
@Controller('normas')
export class NormasController {
    constructor(
        private readonly createNormaUseCase: CreateNormaUseCase,
        private readonly listNormasUseCase: ListNormasUseCase,
        private readonly listPublicNormasUseCase: ListPublicNormasUseCase,
        private readonly getNormaByIdUseCase: GetNormaByIdUseCase,
        private readonly updateNormaUseCase: UpdateNormaUseCase,
        private readonly removeNormaUseCase: RemoveNormaUseCase,
        private readonly registrarSancaoUseCase: RegistrarSancaoUseCase,
        private readonly registrarVetoUseCase: RegistrarVetoUseCase,
        private readonly registrarPromulgacaoUseCase: RegistrarPromulgacaoUseCase,
        private readonly registrarPublicacaoUseCase: RegistrarPublicacaoUseCase,
        private readonly revogarNormaUseCase: RevogarNormaUseCase,
    ) {}

    @Public()
    @Get('public')
    findPublic(@Query() query: ListNormasQueryDto) {
        return this.listPublicNormasUseCase.execute(query);
    }

    @Get()
    findAll(@TenantId() tenantId: string, @Query() query: ListNormasQueryDto) {
        return this.listNormasUseCase.execute(tenantId, query);
    }

    @Get(':id')
    async findOne(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.getNormaByIdUseCase.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Post()
    async create(@TenantId() tenantId: string, @Body() dto: CreateNormaDto) {
        try {
            return await this.createNormaUseCase.execute(tenantId, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...ADMIN_ONLY)
    @Patch(':id')
    async update(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateNormaDto,
    ) {
        try {
            return await this.updateNormaUseCase.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...ADMIN_ONLY)
    @Post(':id/sancao')
    async registrarSancao(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: RegistrarSancaoDto,
    ) {
        return this.registrarSancaoUseCase.execute(tenantId, id, dto);
    }

    @TenantRoles(...ADMIN_ONLY)
    @Post(':id/veto')
    async registrarVeto(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: RegistrarVetoDto,
    ) {
        return this.registrarVetoUseCase.execute(tenantId, id, dto);
    }

    @TenantRoles(...ADMIN_ONLY)
    @Post(':id/promulgacao')
    async registrarPromulgacao(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: RegistrarPromulgacaoDto,
    ) {
        return this.registrarPromulgacaoUseCase.execute(tenantId, id, dto);
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Post(':id/publicacao')
    async registrarPublicacao(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: RegistrarPublicacaoDto,
    ) {
        return this.registrarPublicacaoUseCase.execute(tenantId, id, dto);
    }

    @TenantRoles(...ADMIN_ONLY)
    @Post(':id/revogacao')
    async revogar(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: RevogarNormaDto,
    ) {
        return this.revogarNormaUseCase.execute(tenantId, id, dto);
    }

    @TenantRoles(...ADMIN_ONLY)
    @Delete(':id')
    async remove(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.removeNormaUseCase.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        if (
            error instanceof NormaNotFoundError ||
            error instanceof TipoNormaNotFoundError ||
            error instanceof AnoNotFoundError ||
            error instanceof EsferaFederacaoNotFoundError ||
            error instanceof IdentificadorNormaNotFoundError ||
            error instanceof MateriaOrigemNotFoundError
        ) {
            throw new NotFoundException(error.message);
        }
        if (error instanceof MateriaNaoPodeGerarNormaError) {
            throw new BadRequestException(error.message);
        }
        throw error;
    }
}
