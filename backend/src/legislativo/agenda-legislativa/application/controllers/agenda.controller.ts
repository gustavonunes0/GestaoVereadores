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
import { TenantMaintainer } from '../../../../common/decorators/tenant-maintainer.decorator';
import { TenantId } from '../../../../common/decorators/tenant-id.decorator';
import {
    CreateAgendaDto,
    FilterAgendaDto,
    UpdateAgendaDto,
} from '../dto/agenda.dto';
import {
    AgendaInvalidDateRangeError,
    AgendaNotFoundError,
} from '../errors/agenda.errors';
import { CreateAgendaUseCase } from '../use-cases/create-agenda.use-case';
import { GetAgendaByIdUseCase } from '../use-cases/get-agenda-by-id.use-case';
import { ListAgendaTiposUseCase } from '../use-cases/list-agenda-tipos.use-case';
import { ListAgendasUseCase } from '../use-cases/list-agendas.use-case';
import { RemoveAgendaUseCase } from '../use-cases/remove-agenda.use-case';
import { UpdateAgendaUseCase } from '../use-cases/update-agenda.use-case';

@ApiTags('legislative-agenda-legislativa')
@ApiBearerAuth()
@Controller('legislative/agenda-legislativa')
export class AgendaController {
    constructor(
        private readonly listAgendas: ListAgendasUseCase,
        private readonly listAgendaTipos: ListAgendaTiposUseCase,
        private readonly getAgendaById: GetAgendaByIdUseCase,
        private readonly createAgenda: CreateAgendaUseCase,
        private readonly updateAgenda: UpdateAgendaUseCase,
        private readonly removeAgenda: RemoveAgendaUseCase,
    ) {}

    @Get('tipos')
    listTipos() {
        return this.listAgendaTipos.execute();
    }

    @Get()
    findAll(@TenantId() tenantId: string, @Query() query: FilterAgendaDto) {
        return this.listAgendas.execute(tenantId, query);
    }

    @Get(':id')
    async findOne(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.getAgendaById.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Post()
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateAgendaDto,
    ) {
        try {
            return await this.createAgenda.execute(tenantId, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Patch(':id')
    async update(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateAgendaDto,
    ) {
        try {
            return await this.updateAgenda.execute(tenantId, id, dto);
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
            return await this.removeAgenda.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        if (error instanceof AgendaNotFoundError) {
            throw new NotFoundException(error.message);
        }
        if (error instanceof AgendaInvalidDateRangeError) {
            throw new BadRequestException(error.message);
        }
        throw error;
    }
}
