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
    AddMembroFrenteDto,
    CreateFrenteDto,
    ListFrentesQueryDto,
    UpdateFrenteDto,
} from '../dto/frente.dto';
import {
    FrenteInvalidDateRangeError,
    FrenteMembroNotFoundError,
    FrenteNotFoundError,
    FrenteThemeRequiredError,
    ParliamentarianAlreadyOnFrontError,
    ParliamentarianNotFoundForFrenteError,
    TenantUserNotFoundForFrenteError,
} from '../errors/frente.errors';
import { AddFrenteMembroUseCase } from '../use-cases/add-frente-membro.use-case';
import { CreateFrenteUseCase } from '../use-cases/create-frente.use-case';
import { GetFrenteByIdUseCase } from '../use-cases/get-frente-by-id.use-case';
import { ListFrentesUseCase } from '../use-cases/list-frentes.use-case';
import { RemoveFrenteMembroUseCase } from '../use-cases/remove-frente-membro.use-case';
import { RemoveFrenteUseCase } from '../use-cases/remove-frente.use-case';
import { UpdateFrenteUseCase } from '../use-cases/update-frente.use-case';

@ApiTags('legislative-frentes-parlamentares')
@ApiBearerAuth()
@Controller('legislative/frentes-parlamentares')
export class FrentesController {
    constructor(
        private readonly listFrentes: ListFrentesUseCase,
        private readonly getFrenteById: GetFrenteByIdUseCase,
        private readonly createFrente: CreateFrenteUseCase,
        private readonly updateFrente: UpdateFrenteUseCase,
        private readonly removeFrente: RemoveFrenteUseCase,
        private readonly addFrenteMembro: AddFrenteMembroUseCase,
        private readonly removeFrenteMembro: RemoveFrenteMembroUseCase,
    ) {}

    @Get()
    findAll(
        @TenantId() tenantId: string,
        @Query() query: ListFrentesQueryDto,
    ) {
        return this.listFrentes.execute(tenantId, query);
    }

    @Get(':id')
    async findOne(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.getFrenteById.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Post()
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateFrenteDto,
    ) {
        try {
            return await this.createFrente.execute(tenantId, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Patch(':id')
    async update(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateFrenteDto,
    ) {
        try {
            return await this.updateFrente.execute(tenantId, id, dto);
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
            await this.removeFrente.execute(tenantId, id);
            return { success: true };
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Post(':id/membros')
    async addMembro(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AddMembroFrenteDto,
    ) {
        try {
            return await this.addFrenteMembro.execute(tenantId, id, dto);
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
            return await this.removeFrenteMembro.execute(
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
            error instanceof FrenteNotFoundError ||
            error instanceof ParliamentarianNotFoundForFrenteError ||
            error instanceof TenantUserNotFoundForFrenteError ||
            error instanceof FrenteMembroNotFoundError
        ) {
            throw new NotFoundException(error.message);
        }
        if (error instanceof ParliamentarianAlreadyOnFrontError) {
            throw new ConflictException(error.message);
        }
        if (
            error instanceof FrenteInvalidDateRangeError ||
            error instanceof FrenteThemeRequiredError
        ) {
            throw new BadRequestException(error.message);
        }
        throw error;
    }
}
