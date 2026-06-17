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
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantUserRole } from '@prisma/client';
import { TenantId } from '../../../../common/decorators/tenant-id.decorator';
import { TenantRoles } from '../../../../common/decorators/tenant-roles.decorator';
import { TenantRolesGuard } from '../../../../common/guards/tenant-roles.guard';
import { CreateAutorExternoDto } from '../dto/create-autor-externo.dto';
import { ListAutoresExternosQueryDto } from '../dto/list-autores-externos-query.dto';
import { UpdateAutorExternoDto } from '../dto/update-autor-externo.dto';
import {
    AutorExternoNotFoundError,
    TipoAutorInvalidoError,
} from '../errors/autor-externo.errors';
import { CreateAutorExternoUseCase } from '../use-cases/create-autor-externo.use-case';
import { GetAutorExternoByIdUseCase } from '../use-cases/get-autor-externo-by-id.use-case';
import { ListAutorExternoMateriasUseCase } from '../use-cases/list-autor-externo-materias.use-case';
import { ListAutoresExternosIdentidadeUseCase } from '../use-cases/list-autores-externos.use-case';
import { RemoveAutorExternoUseCase } from '../use-cases/remove-autor-externo.use-case';
import { UpdateAutorExternoUseCase } from '../use-cases/update-autor-externo.use-case';

@ApiTags('autores-externos')
@ApiBearerAuth()
@Controller('identidade/autores-externos')
export class AutoresExternosController {
    constructor(
        private readonly listAutoresExternos: ListAutoresExternosIdentidadeUseCase,
        private readonly getAutorExternoById: GetAutorExternoByIdUseCase,
        private readonly createAutorExterno: CreateAutorExternoUseCase,
        private readonly updateAutorExterno: UpdateAutorExternoUseCase,
        private readonly removeAutorExterno: RemoveAutorExternoUseCase,
        private readonly listAutorExternoMaterias: ListAutorExternoMateriasUseCase,
    ) {}

    @Get()
    list(
        @TenantId() tenantId: string,
        @Query() query: ListAutoresExternosQueryDto,
    ) {
        return this.listAutoresExternos.execute(tenantId, query);
    }

    @Get(':id/materias')
    async listMaterias(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.listAutorExternoMaterias.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get(':id')
    async getById(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.getAutorExternoById.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @UseGuards(TenantRolesGuard)
    @TenantRoles(TenantUserRole.ADMIN_STAFF, TenantUserRole.STAFF)
    @Post()
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateAutorExternoDto,
    ) {
        try {
            return await this.createAutorExterno.execute(tenantId, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @UseGuards(TenantRolesGuard)
    @TenantRoles(TenantUserRole.ADMIN_STAFF, TenantUserRole.STAFF)
    @Patch(':id')
    async update(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateAutorExternoDto,
    ) {
        try {
            return await this.updateAutorExterno.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @UseGuards(TenantRolesGuard)
    @TenantRoles(TenantUserRole.ADMIN_STAFF, TenantUserRole.STAFF)
    @Delete(':id')
    async remove(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            await this.removeAutorExterno.execute(tenantId, id);
            return { success: true };
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        if (error instanceof AutorExternoNotFoundError) {
            throw new NotFoundException(error.message);
        }
        if (error instanceof TipoAutorInvalidoError) {
            throw new BadRequestException(error.message);
        }
        throw error;
    }
}
