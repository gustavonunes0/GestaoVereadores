import {
    Body,
    ConflictException,
    Controller,
    Delete,
    Get,
    BadRequestException,
    NotFoundException,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
    MasterOnly,
    ReadRoles,
} from '../../../../common/decorators/api-roles.decorator';
import { SkipTenant } from '../../../../common/decorators/skip-tenant.decorator';
import { TenantNotFoundError } from '../../../tenants/application/errors/tenant-not-found.error';
import { UserNotFoundError } from '../../../users/application/errors/user-not-found.error';
import { CreateTenantUserDto } from '../dto/create-tenant-user.dto';
import { ListTenantUsersQueryDto } from '../dto/list-tenant-users-query.dto';
import { UpdateTenantUserDto } from '../dto/update-tenant-user.dto';
import { TenantUserAlreadyExistsError } from '../errors/tenant-user-already-exists.error';
import { TenantUserHasActiveParliamentarianError } from '../errors/tenant-user-has-active-parliamentarian.error';
import { TenantUserNotFoundError } from '../errors/tenant-user-not-found.error';
import { CreateTenantUserUseCase } from '../use-cases/create-tenant-user.use-case';
import { GetTenantUserByIdUseCase } from '../use-cases/get-tenant-user-by-id.use-case';
import { ListTenantUsersUseCase } from '../use-cases/list-tenant-users.use-case';
import { RemoveTenantUserUseCase } from '../use-cases/remove-tenant-user.use-case';
import { UpdateTenantUserUseCase } from '../use-cases/update-tenant-user.use-case';

@ApiTags('tenant-users')
@ApiBearerAuth()
@SkipTenant()
@Controller('tenant-users')
export class TenantUsersController {
    constructor(
        private readonly createTenantUserUseCase: CreateTenantUserUseCase,
        private readonly listTenantUsersUseCase: ListTenantUsersUseCase,
        private readonly getTenantUserByIdUseCase: GetTenantUserByIdUseCase,
        private readonly updateTenantUserUseCase: UpdateTenantUserUseCase,
        private readonly removeTenantUserUseCase: RemoveTenantUserUseCase,
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
    list(@Query() query: ListTenantUsersQueryDto) {
        return this.listTenantUsersUseCase.execute(query);
    }

    @ReadRoles()
    @Get(':id')
    async findById(@Param('id') id: string) {
        try {
            return await this.getTenantUserByIdUseCase.execute(id);
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
            await this.removeTenantUserUseCase.execute(id);
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

        if (error instanceof TenantUserHasActiveParliamentarianError) {
            throw new BadRequestException(error.message);
        }

        throw error;
    }
}
