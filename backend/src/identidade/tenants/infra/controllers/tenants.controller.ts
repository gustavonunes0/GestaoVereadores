import {
    Body,
    ConflictException,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
    MasterOnly,
    ReadRoles,
} from '../../../../common/decorators/api-roles.decorator';
import { SkipTenant } from '../../../../common/decorators/skip-tenant.decorator';
import { CreateTenantDto } from '../../application/dtos/requests/create-tenant.request';
import { UpdateTenantDto } from '../../application/dtos/requests/update-tenant.request';
import { TenantCnpjAlreadyInUseError } from '../../application/errors/tenant-cnpj-already-in-use.error';
import { TenantNotFoundError } from '../../application/errors/tenant-not-found.error';
import { CreateTenantUseCase } from '../../application/use-cases/create-tenant.use-case';
import { DeleteTenantUseCase } from '../../application/use-cases/delete-tenant.use-case';
import { FindAllTenantsUseCase } from '../../application/use-cases/find-all-tenants.use-case';
import { FindTenantByIdUseCase } from '../../application/use-cases/find-tenant-by-id.use-case';
import { UpdateTenantUseCase } from '../../application/use-cases/update-tenant.use-case';

@ApiTags('tenants')
@ApiBearerAuth()
@SkipTenant()
@Controller('tenants')
export class TenantsController {
    constructor(
        private readonly createTenantUseCase: CreateTenantUseCase,
        private readonly findAllTenantsUseCase: FindAllTenantsUseCase,
        private readonly findTenantByIdUseCase: FindTenantByIdUseCase,
        private readonly updateTenantUseCase: UpdateTenantUseCase,
        private readonly deleteTenantUseCase: DeleteTenantUseCase,
    ) {}

    @MasterOnly()
    @Post()
    async create(@Body() dto: CreateTenantDto) {
        try {
            return await this.createTenantUseCase.execute(dto);
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    @ReadRoles()
    @Get()
    findAll() {
        return this.findAllTenantsUseCase.execute();
    }

    @ReadRoles()
    @Get(':id')
    async findById(@Param('id') id: string) {
        try {
            return await this.findTenantByIdUseCase.execute(id);
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    @MasterOnly()
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
        try {
            return await this.updateTenantUseCase.execute(id, dto);
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    @MasterOnly()
    @Delete(':id')
    async remove(@Param('id') id: string) {
        try {
            await this.deleteTenantUseCase.execute(id);
            return { success: true };
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    private handleApplicationError(error: unknown): never {
        if (error instanceof TenantNotFoundError) {
            throw new NotFoundException(error.message);
        }

        if (error instanceof TenantCnpjAlreadyInUseError) {
            throw new ConflictException(error.message);
        }

        throw error;
    }
}
