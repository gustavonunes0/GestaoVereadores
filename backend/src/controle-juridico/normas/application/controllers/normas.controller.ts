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
    Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantMaintainer } from '../../../../common/decorators/tenant-maintainer.decorator';
import { TenantId } from '../../../../common/decorators/tenant-id.decorator';
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
    TipoNormaNotFoundError } from '../errors/norma.errors';
import { CreateNormaUseCase } from '../use-cases/create-norma.use-case';
import { GetNormaByIdUseCase } from '../use-cases/get-norma-by-id.use-case';
import { ListNormasUseCase } from '../use-cases/list-normas.use-case';
import { RemoveNormaUseCase } from '../use-cases/remove-norma.use-case';
import { UpdateNormaUseCase } from '../use-cases/update-norma.use-case';

@ApiTags('normas')
@ApiBearerAuth()
@Controller('normas')
export class NormasController {
    constructor(
        private readonly createNormaUseCase: CreateNormaUseCase,
        private readonly listNormasUseCase: ListNormasUseCase,
        private readonly getNormaByIdUseCase: GetNormaByIdUseCase,
        private readonly updateNormaUseCase: UpdateNormaUseCase,
        private readonly removeNormaUseCase: RemoveNormaUseCase,
    ) {}

    @Get()
    findAll(
        @TenantId() tenantId: string,
        @Query() query: ListNormasQueryDto,
    ) {
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

        @TenantMaintainer()
    @Post()
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateNormaDto,
    ) {
        try {
            return await this.createNormaUseCase.execute(tenantId, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

        @TenantMaintainer()
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

        @TenantMaintainer()
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
