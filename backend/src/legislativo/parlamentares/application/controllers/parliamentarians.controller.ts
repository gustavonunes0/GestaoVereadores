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
import { CreateParliamentarianDto } from '../dto/create-parliamentarian.dto';
import { ListParliamentariansQueryDto } from '../dto/list-parliamentarians-query.dto';
import { UpdateParliamentarianDto } from '../dto/update-parliamentarian.dto';
import {
    ParliamentarianAlreadyExistsError,
    ParliamentarianNotFoundError,
    PoliticalPartyNotFoundForParliamentarianError,
    PoliticalPartyRemovedForParliamentarianError,
    TenantUserNotFoundForParliamentarianError,
    TenantUserNotParliamentarianError } from '../errors/parliamentarian.errors';
import { CreateParliamentarianUseCase } from '../use-cases/create-parliamentarian.use-case';
import { GetParliamentarianByIdUseCase } from '../use-cases/get-parliamentarian-by-id.use-case';
import { ListParliamentariansUseCase } from '../use-cases/list-parliamentarians.use-case';
import { RemoveParliamentarianUseCase } from '../use-cases/remove-parliamentarian.use-case';
import { UpdateParliamentarianUseCase } from '../use-cases/update-parliamentarian.use-case';

@ApiTags('legislative-parlamentares')
@ApiBearerAuth()
@Controller('legislative/parlamentares')
export class ParliamentariansController {
    constructor(
        private readonly createParliamentarianUseCase: CreateParliamentarianUseCase,
        private readonly listParliamentariansUseCase: ListParliamentariansUseCase,
        private readonly getParliamentarianByIdUseCase: GetParliamentarianByIdUseCase,
        private readonly updateParliamentarianUseCase: UpdateParliamentarianUseCase,
        private readonly removeParliamentarianUseCase: RemoveParliamentarianUseCase,
    ) {}

    @Get()
    list(
        @TenantId() tenantId: string,
        @Query() query: ListParliamentariansQueryDto,
    ) {
        return this.listParliamentariansUseCase.execute(tenantId, query);
    }

    @Get(':id')
    async getById(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.getParliamentarianByIdUseCase.execute(
                tenantId,
                id,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

        @TenantMaintainer()
    @Post()
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateParliamentarianDto,
    ) {
        try {
            return await this.createParliamentarianUseCase.execute(
                tenantId,
                dto,
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
        @Body() dto: UpdateParliamentarianDto,
    ) {
        try {
            return await this.updateParliamentarianUseCase.execute(
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
            return await this.removeParliamentarianUseCase.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        if (error instanceof ParliamentarianNotFoundError) {
            throw new NotFoundException(error.message);
        }
        if (
            error instanceof PoliticalPartyNotFoundForParliamentarianError ||
            error instanceof PoliticalPartyRemovedForParliamentarianError
        ) {
            throw new NotFoundException(error.message);
        }
        if (error instanceof TenantUserNotFoundForParliamentarianError) {
            throw new NotFoundException(error.message);
        }
        if (error instanceof ParliamentarianAlreadyExistsError) {
            throw new ConflictException(error.message);
        }
        if (error instanceof TenantUserNotParliamentarianError) {
            throw new BadRequestException(error.message);
        }
        throw error;
    }
}
