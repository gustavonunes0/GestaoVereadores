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
    Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantMaintainer } from '../../../../common/decorators/tenant-maintainer.decorator';
import { TenantId } from '../../../../common/decorators/tenant-id.decorator';
import { CreateLegislatureDto } from '../dto/create-legislature.dto';
import { ListLegislaturesQueryDto } from '../dto/list-legislatures-query.dto';
import { UpdateLegislatureDto } from '../dto/update-legislature.dto';
import {
    LegislatureHasActiveMandatesError,
    LegislatureInvalidDateRangeError,
    LegislatureNotFoundError,
    LegislatureNumberAlreadyInUseError } from '../errors/legislature.errors';
import { CreateLegislatureUseCase } from '../use-cases/create-legislature.use-case';
import { GetLegislatureByIdUseCase } from '../use-cases/get-legislature-by-id.use-case';
import { ListLegislaturesUseCase } from '../use-cases/list-legislatures.use-case';
import { RemoveLegislatureUseCase } from '../use-cases/remove-legislature.use-case';
import { UpdateLegislatureUseCase } from '../use-cases/update-legislature.use-case';

@ApiTags('legislative-legislaturas')
@ApiBearerAuth()
@Controller('legislative/legislaturas')
export class LegislaturesController {
    constructor(
        private readonly createLegislatureUseCase: CreateLegislatureUseCase,
        private readonly listLegislaturesUseCase: ListLegislaturesUseCase,
        private readonly getLegislatureByIdUseCase: GetLegislatureByIdUseCase,
        private readonly updateLegislatureUseCase: UpdateLegislatureUseCase,
        private readonly removeLegislatureUseCase: RemoveLegislatureUseCase,
    ) {}

    @Get()
    list(
        @TenantId() tenantId: string,
        @Query() query: ListLegislaturesQueryDto,
    ) {
        return this.listLegislaturesUseCase.execute(tenantId, query);
    }

    @Get(':id')
    async getById(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.getLegislatureByIdUseCase.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

        @TenantMaintainer()
    @Post()
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateLegislatureDto,
    ) {
        try {
            return await this.createLegislatureUseCase.execute(tenantId, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

        @TenantMaintainer()
    @Patch(':id')
    async update(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateLegislatureDto,
    ) {
        try {
            return await this.updateLegislatureUseCase.execute(
                tenantId,
                id,
                dto,
            );
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
            await this.removeLegislatureUseCase.execute(tenantId, id);
            return { success: true };
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        if (error instanceof LegislatureNotFoundError) {
            throw new NotFoundException(error.message);
        }
        if (error instanceof LegislatureNumberAlreadyInUseError) {
            throw new ConflictException(error.message);
        }
        if (
            error instanceof LegislatureHasActiveMandatesError ||
            error instanceof LegislatureInvalidDateRangeError
        ) {
            throw new BadRequestException(error.message);
        }
        throw error;
    }
}
