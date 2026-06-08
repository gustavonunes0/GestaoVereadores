import {
    UserCpfAlreadyInUseError,
    UserEmailAlreadyInUseError,
    UserNotFoundError,
} from '../../application/errors';
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
import { CreateUserDto } from '../../application/dtos/requests/createUser.requests';
import { UpdateUserDto } from '../../application/dtos/requests/updateUser.requests';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { FindAllUsersUseCase } from '../../application/use-cases/find-all-users.use-case';
import { FindUserByIdUseCase } from '../../application/use-cases/find-user-by-id.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';

@ApiTags('users')
@ApiBearerAuth()
@SkipTenant()
@Controller('users')
export class UsersController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly findAllUsersUseCase: FindAllUsersUseCase,
        private readonly findUserByIdUseCase: FindUserByIdUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
    ) {}

    @MasterOnly()
    @Post()
    async create(@Body() dto: CreateUserDto) {
        try {
            return await this.createUserUseCase.execute(dto);
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    @ReadRoles()
    @Get()
    findAll() {
        return this.findAllUsersUseCase.execute();
    }

    @ReadRoles()
    @Get(':id')
    async findById(@Param('id') id: string) {
        try {
            return await this.findUserByIdUseCase.execute(id);
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    @MasterOnly()
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        try {
            return await this.updateUserUseCase.execute(id, dto);
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    @MasterOnly()
    @Delete(':id')
    async remove(@Param('id') id: string) {
        try {
            await this.deleteUserUseCase.execute(id);
            return { success: true };
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    private handleApplicationError(error: unknown): never {
        if (error instanceof UserNotFoundError) {
            throw new NotFoundException(error.message);
        }

        if (error instanceof UserEmailAlreadyInUseError) {
            throw new ConflictException(error.message);
        }

        if (error instanceof UserCpfAlreadyInUseError) {
            throw new ConflictException(error.message);
        }

        throw error;
    }
}
