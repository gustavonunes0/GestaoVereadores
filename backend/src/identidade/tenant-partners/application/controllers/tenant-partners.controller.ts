import {
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
import { TenantRoles } from '../../../../common/decorators/tenant-roles.decorator';
import { TenantId } from '../../../../common/decorators/tenant-id.decorator';
import { STAFF_AND_ABOVE } from '../../../../auth/guards/guard-combos';
import { TenantPartnerNotFoundError } from '../errors/tenant-partner-not-found.error';
import { CreateTenantPartnerDto } from '../dto/create-tenant-partner.dto';
import { UpdateTenantPartnerDto } from '../dto/update-tenant-partner.dto';
import { ListTenantPartnersQueryDto } from '../dto/list-tenant-partners-query.dto';
import { CreateTenantPartnerUseCase } from '../use-cases/create-tenant-partner.use-case';
import { ListTenantPartnersUseCase } from '../use-cases/list-tenant-partners.use-case';
import { GetTenantPartnerByIdUseCase } from '../use-cases/get-tenant-partner-by-id.use-case';
import { UpdateTenantPartnerUseCase } from '../use-cases/update-tenant-partner.use-case';
import { RemoveTenantPartnerUseCase } from '../use-cases/remove-tenant-partner.use-case';
import { ProvisionTenantPartnerUserUseCase } from '../use-cases/provision-tenant-partner-user.use-case';
import { UpdateTenantPartnerUserUseCase } from '../use-cases/update-tenant-partner-user.use-case';
import { RemoveTenantPartnerUserUseCase } from '../use-cases/remove-tenant-partner-user.use-case';
import { ProvisionTenantPartnerUserDto } from '../dto/provision-tenant-partner-user.dto';
import { UpdateTenantPartnerUserDto } from '../dto/update-tenant-partner-user.dto';
import { TenantPartnerUserAlreadyExistsError } from '../errors/tenant-partner-user-already-exists.error';
import { TenantPartnerUserNotFoundError } from '../errors/tenant-partner-user-not-found.error';

@ApiTags('tenant-partners')
@ApiBearerAuth()
@Controller('identidade/tenant-partners')
export class TenantPartnersController {
    constructor(
        private readonly createUseCase: CreateTenantPartnerUseCase,
        private readonly listUseCase: ListTenantPartnersUseCase,
        private readonly getByIdUseCase: GetTenantPartnerByIdUseCase,
        private readonly updateUseCase: UpdateTenantPartnerUseCase,
        private readonly removeUseCase: RemoveTenantPartnerUseCase,
        private readonly provisionUserUseCase: ProvisionTenantPartnerUserUseCase,
        private readonly updatePartnerUserUseCase: UpdateTenantPartnerUserUseCase,
        private readonly removePartnerUserUseCase: RemoveTenantPartnerUserUseCase,
    ) {}

    @TenantRoles(...STAFF_AND_ABOVE)
    @Get()
    list(
        @TenantId() tenantId: string,
        @Query() query: ListTenantPartnersQueryDto,
    ) {
        return this.listUseCase.execute(tenantId, query);
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Get(':id')
    async getById(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.getByIdUseCase.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Post()
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateTenantPartnerDto,
    ) {
        return this.createUseCase.execute(tenantId, dto);
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Patch(':id')
    async update(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateTenantPartnerDto,
    ) {
        try {
            return await this.updateUseCase.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Post(':id/usuario')
    async provisionUser(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: ProvisionTenantPartnerUserDto,
    ) {
        try {
            return await this.provisionUserUseCase.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Patch(':id/usuario')
    async updatePartnerUser(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateTenantPartnerUserDto,
    ) {
        try {
            return await this.updatePartnerUserUseCase.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Delete(':id/usuario')
    async removePartnerUser(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.removePartnerUserUseCase.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Delete(':id')
    async remove(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.removeUseCase.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        if (error instanceof TenantPartnerNotFoundError) {
            throw new NotFoundException(error.message);
        }
        if (error instanceof TenantPartnerUserAlreadyExistsError) {
            throw new ConflictException(error.message);
        }
        if (error instanceof TenantPartnerUserNotFoundError) {
            throw new NotFoundException(error.message);
        }
        throw error;
    }
}
