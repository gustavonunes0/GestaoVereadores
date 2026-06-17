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
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantUserRole } from '@prisma/client';
import { TenantId } from '../../../../common/decorators/tenant-id.decorator';
import { TenantRoles } from '../../../../common/decorators/tenant-roles.decorator';
import { TenantRolesGuard } from '../../../../common/guards/tenant-roles.guard';
import { CreateGuestUserDto } from '../dto/create-guest-user.dto';
import { ListGuestUsersQueryDto } from '../dto/list-guest-users-query.dto';
import { UpdateGuestUserDto } from '../dto/update-guest-user.dto';
import { GuestUserCpfAlreadyInUseError } from '../errors/guest-user-cpf-already-in-use.error';
import { GuestUserNotFoundError } from '../errors/guest-user-not-found.error';
import { CreateGuestUserUseCase } from '../use-cases/create-guest-user.use-case';
import { GetGuestUserByIdUseCase } from '../use-cases/get-guest-user-by-id.use-case';
import { ListGuestUsersUseCase } from '../use-cases/list-guest-users.use-case';
import { RemoveGuestUserUseCase } from '../use-cases/remove-guest-user.use-case';
import { UpdateGuestUserUseCase } from '../use-cases/update-guest-user.use-case';

@ApiTags('guest-users')
@ApiBearerAuth()
@Controller('guest-users')
export class GuestUsersController {
    constructor(
        private readonly createGuestUserUseCase: CreateGuestUserUseCase,
        private readonly listGuestUsersUseCase: ListGuestUsersUseCase,
        private readonly getGuestUserByIdUseCase: GetGuestUserByIdUseCase,
        private readonly updateGuestUserUseCase: UpdateGuestUserUseCase,
        private readonly removeGuestUserUseCase: RemoveGuestUserUseCase,
    ) {}

    @Get()
    list(
        @TenantId() tenantId: string,
        @Query() query: ListGuestUsersQueryDto,
    ) {
        return this.listGuestUsersUseCase.execute(tenantId, query);
    }

    @Get(':id')
    async getById(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.getGuestUserByIdUseCase.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @UseGuards(TenantRolesGuard)
    @TenantRoles(TenantUserRole.ADMIN_STAFF)
    @Post()
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateGuestUserDto,
    ) {
        try {
            return await this.createGuestUserUseCase.execute(tenantId, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @UseGuards(TenantRolesGuard)
    @TenantRoles(TenantUserRole.ADMIN_STAFF)
    @Patch(':id')
    async update(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateGuestUserDto,
    ) {
        try {
            return await this.updateGuestUserUseCase.execute(
                tenantId,
                id,
                dto,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @UseGuards(TenantRolesGuard)
    @TenantRoles(TenantUserRole.ADMIN_STAFF)
    @Delete(':id')
    async remove(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            await this.removeGuestUserUseCase.execute(tenantId, id);
            return { success: true };
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        if (error instanceof GuestUserNotFoundError) {
            throw new NotFoundException(error.message);
        }
        if (error instanceof GuestUserCpfAlreadyInUseError) {
            throw new ConflictException(error.message);
        }
        throw error;
    }
}
