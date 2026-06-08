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
import { CreatePoliticalPartyDto } from '../dto/create-political-party.dto';
import { ListPoliticalPartiesQueryDto } from '../dto/list-political-parties-query.dto';
import { UpdatePoliticalPartyDto } from '../dto/update-political-party.dto';
import {
    PoliticalPartyAcronymAlreadyInUseError,
    PoliticalPartyHasActiveParliamentariansError,
    PoliticalPartyNameAlreadyInUseError,
    PoliticalPartyNotFoundError } from '../errors/political-party.errors';
import { CreatePoliticalPartyUseCase } from '../use-cases/create-political-party.use-case';
import { GetPoliticalPartyByIdUseCase } from '../use-cases/get-political-party-by-id.use-case';
import { ListPoliticalPartiesUseCase } from '../use-cases/list-political-parties.use-case';
import { RemovePoliticalPartyUseCase } from '../use-cases/remove-political-party.use-case';
import { UpdatePoliticalPartyUseCase } from '../use-cases/update-political-party.use-case';

@ApiTags('legislative-partidos-politicos')
@ApiBearerAuth()
@Controller('legislative/partidos-politicos')
export class PoliticalPartiesController {
    constructor(
        private readonly createPoliticalPartyUseCase: CreatePoliticalPartyUseCase,
        private readonly listPoliticalPartiesUseCase: ListPoliticalPartiesUseCase,
        private readonly getPoliticalPartyByIdUseCase: GetPoliticalPartyByIdUseCase,
        private readonly updatePoliticalPartyUseCase: UpdatePoliticalPartyUseCase,
        private readonly removePoliticalPartyUseCase: RemovePoliticalPartyUseCase,
    ) {}

    @Get()
    list(
        @TenantId() tenantId: string,
        @Query() query: ListPoliticalPartiesQueryDto,
    ) {
        return this.listPoliticalPartiesUseCase.execute(tenantId, query);
    }

    @Get(':id')
    async getById(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.getPoliticalPartyByIdUseCase.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

        @TenantMaintainer()
    @Post()
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreatePoliticalPartyDto,
    ) {
        try {
            return await this.createPoliticalPartyUseCase.execute(tenantId, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

        @TenantMaintainer()
    @Patch(':id')
    async update(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdatePoliticalPartyDto,
    ) {
        try {
            return await this.updatePoliticalPartyUseCase.execute(
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
            await this.removePoliticalPartyUseCase.execute(tenantId, id);
            return { success: true };
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        if (error instanceof PoliticalPartyNotFoundError) {
            throw new NotFoundException(error.message);
        }
        if (
            error instanceof PoliticalPartyAcronymAlreadyInUseError ||
            error instanceof PoliticalPartyNameAlreadyInUseError
        ) {
            throw new ConflictException(error.message);
        }
        if (error instanceof PoliticalPartyHasActiveParliamentariansError) {
            throw new BadRequestException(error.message);
        }
        throw error;
    }
}
