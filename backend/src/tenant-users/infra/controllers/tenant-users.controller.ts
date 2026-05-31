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
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MasterOnly, ReadRoles } from '../../../common/decorators/api-roles.decorator';
import { SkipTenant } from '../../../common/decorators/skip-tenant.decorator';
import { TenantNotFoundError } from '../../../tenants/application/errors/tenant-not-found.error';
import { UserNotFoundError } from '../../../users/application/errors/user-not-found.error';
import { CreateTenantUserDto } from '../../application/dtos/requests/create-tenant-user.request';
import { ListTenantUsersDto } from '../../application/dtos/requests/list-tenant-users.request';
import { UpdateTenantUserDto } from '../../application/dtos/requests/update-tenant-user.request';
import { TenantUserAlreadyExistsError } from '../../application/errors/tenant-user-already-exists.error';
import { TenantUserNotFoundError } from '../../application/errors/tenant-user-not-found.error';
import { CreateTenantUserUseCase } from '../../application/use-cases/create-tenant-user.use-case';
import { DeleteTenantUserUseCase } from '../../application/use-cases/delete-tenant-user.use-case';
import { FindAllTenantUsersUseCase } from '../../application/use-cases/find-all-tenant-users.use-case';
import { FindTenantUserByIdUseCase } from '../../application/use-cases/find-tenant-user-by-id.use-case';
import { UpdateTenantUserUseCase } from '../../application/use-cases/update-tenant-user.use-case';

@ApiTags('tenant-users')
@ApiBearerAuth()
@SkipTenant()
@Controller('tenant-users')
export class TenantUsersController {
    constructor(
        private readonly createTenantUserUseCase: CreateTenantUserUseCase,
        private readonly findAllTenantUsersUseCase: FindAllTenantUsersUseCase,
        private readonly findTenantUserByIdUseCase: FindTenantUserByIdUseCase,
        private readonly updateTenantUserUseCase: UpdateTenantUserUseCase,
        private readonly deleteTenantUserUseCase: DeleteTenantUserUseCase,
    ) {}

    @MasterOnly()
    @Post()
    async create(@Body() dto: CreateTenantUserDto) {
        try {
            return await this.createTenantUserUseCase.execute(dto);
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    @ReadRoles()
    @Get()
    findAll(@Query() query: ListTenantUsersDto) {
        return this.findAllTenantUsersUseCase.execute(query);
    }

    @ReadRoles()
    @Get(':id')
    async findById(@Param('id') id: string) {
        try {
            return await this.findTenantUserByIdUseCase.execute(id);
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    @MasterOnly()
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateTenantUserDto) {
        try {
            return await this.updateTenantUserUseCase.execute(id, dto);
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    @MasterOnly()
    @Delete(':id')
    async remove(@Param('id') id: string) {
        try {
            await this.deleteTenantUserUseCase.execute(id);
            return { success: true };
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    private handleApplicationError(error: unknown): never {
        if (
            error instanceof TenantUserNotFoundError ||
            error instanceof TenantNotFoundError ||
            error instanceof UserNotFoundError
        ) {
            throw new NotFoundException(error.message);
        }

        if (error instanceof TenantUserAlreadyExistsError) {
            throw new ConflictException(error.message);
        }

        throw error;
    }
}
