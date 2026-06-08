import {
    BadRequestException,
    Body,
    ConflictException,
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
    AddMembroMesaDto,
    CreateCargoMesaDto,
    CreateMesaDiretoraDto,
    ListMesaDiretoraQueryDto,
    UpdateMesaDiretoraDto,
} from '../dto/mesa-diretora.dto';
import {
    BoardRoleAlreadyOccupiedError,
    BoardRoleNameAlreadyInUseError,
    BoardRoleNotFoundForMesaDiretoraError,
    LegislatureNotFoundForMesaDiretoraError,
    MesaDiretoraInvalidDateRangeError,
    MesaDiretoraMembroNotFoundError,
    MesaDiretoraNotFoundError,
    ParliamentarianAlreadyOnBoardError,
    ParliamentarianNotFoundForMesaDiretoraError,
} from '../errors/mesa-diretora.errors';
import { AddMesaDiretoraMembroUseCase } from '../use-cases/add-mesa-diretora-membro.use-case';
import { CreateCargoMesaUseCase } from '../use-cases/create-cargo-mesa.use-case';
import { CreateMesaDiretoraUseCase } from '../use-cases/create-mesa-diretora.use-case';
import { GetMesaDiretoraByIdUseCase } from '../use-cases/get-mesa-diretora-by-id.use-case';
import { ListCargosMesaUseCase } from '../use-cases/list-cargos-mesa.use-case';
import { ListMesaDiretoraUseCase } from '../use-cases/list-mesa-diretora.use-case';
import { RemoveMesaDiretoraMembroUseCase } from '../use-cases/remove-mesa-diretora-membro.use-case';
import { UpdateMesaDiretoraUseCase } from '../use-cases/update-mesa-diretora.use-case';

@ApiTags('legislative-mesa-diretora')
@ApiBearerAuth()
@Controller('legislative/mesa-diretora')
export class MesaDiretoraController {
    constructor(
        private readonly listMesaDiretora: ListMesaDiretoraUseCase,
        private readonly getMesaDiretoraById: GetMesaDiretoraByIdUseCase,
        private readonly createMesaDiretora: CreateMesaDiretoraUseCase,
        private readonly updateMesaDiretora: UpdateMesaDiretoraUseCase,
        private readonly addMesaDiretoraMembro: AddMesaDiretoraMembroUseCase,
        private readonly removeMesaDiretoraMembro: RemoveMesaDiretoraMembroUseCase,
        private readonly listCargosMesa: ListCargosMesaUseCase,
        private readonly createCargoMesa: CreateCargoMesaUseCase,
    ) {}

    @Get()
    list(
        @TenantId() tenantId: string,
        @Query() query: ListMesaDiretoraQueryDto,
    ) {
        return this.listMesaDiretora.execute(tenantId, query);
    }

    @Get('cargos')
    listCargos(@TenantId() tenantId: string) {
        return this.listCargosMesa.execute(tenantId);
    }

    @Get(':id')
    async findOne(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.getMesaDiretoraById.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Post()
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateMesaDiretoraDto,
    ) {
        try {
            return await this.createMesaDiretora.execute(tenantId, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Post('cargos')
    async createCargo(
        @TenantId() tenantId: string,
        @Body() dto: CreateCargoMesaDto,
    ) {
        try {
            return await this.createCargoMesa.execute(tenantId, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Patch(':id')
    async update(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateMesaDiretoraDto,
    ) {
        try {
            return await this.updateMesaDiretora.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Post(':id/membros')
    async addMembro(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AddMembroMesaDto,
    ) {
        try {
            return await this.addMesaDiretoraMembro.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Delete(':id/membros/:membroId')
    async removeMembro(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('membroId', ParseUUIDPipe) membroId: string,
    ) {
        try {
            return await this.removeMesaDiretoraMembro.execute(
                tenantId,
                id,
                membroId,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        if (
            error instanceof MesaDiretoraNotFoundError ||
            error instanceof LegislatureNotFoundForMesaDiretoraError ||
            error instanceof ParliamentarianNotFoundForMesaDiretoraError ||
            error instanceof BoardRoleNotFoundForMesaDiretoraError ||
            error instanceof MesaDiretoraMembroNotFoundError
        ) {
            throw new NotFoundException(error.message);
        }
        if (
            error instanceof BoardRoleAlreadyOccupiedError ||
            error instanceof ParliamentarianAlreadyOnBoardError ||
            error instanceof BoardRoleNameAlreadyInUseError
        ) {
            throw new ConflictException(error.message);
        }
        if (error instanceof MesaDiretoraInvalidDateRangeError) {
            throw new BadRequestException(error.message);
        }
        throw error;
    }
}
