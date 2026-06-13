import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
    MasterOnly,
    ReadRoles,
} from '../../../common/decorators/api-roles.decorator';
import { SkipTenant } from '../../../common/decorators/skip-tenant.decorator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import {
    ChangePasswordDto,
    CreateUsuarioDto,
    UpdateUsuarioDto,
} from '../dto/usuario.dto';
import {
    InvalidCurrentPasswordError,
    SiglUserNotFoundError,
    SiglUsernameAlreadyInUseError,
} from '../errors/auth.errors';
import { ChangeSiglUserPasswordUseCase } from '../use-cases/change-sigl-user-password.use-case';
import { CreateSiglUserUseCase } from '../use-cases/create-sigl-user.use-case';
import { ListSiglUsersUseCase } from '../use-cases/list-sigl-users.use-case';
import { UpdateSiglUserUseCase } from '../use-cases/update-sigl-user.use-case';

@ApiTags('usuarios')
@ApiBearerAuth()
@SkipTenant()
@Controller('usuarios')
export class UsuariosController {
    constructor(
        private readonly listSiglUsers: ListSiglUsersUseCase,
        private readonly createSiglUser: CreateSiglUserUseCase,
        private readonly updateSiglUser: UpdateSiglUserUseCase,
        private readonly changeSiglUserPassword: ChangeSiglUserPasswordUseCase,
    ) {}

    @MasterOnly()
    @Get()
    findAll(@Query() query: PaginationQueryDto) {
        return this.listSiglUsers.execute(query);
    }

    @MasterOnly()
    @Post()
    async create(@Body() dto: CreateUsuarioDto) {
        try {
            return await this.createSiglUser.execute(dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @ReadRoles()
    @Patch('me/senha')
    async changePassword(
        @Req() req: { user: { id: string } },
        @Body() dto: ChangePasswordDto,
    ) {
        try {
            return await this.changeSiglUserPassword.execute(req.user.id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @MasterOnly()
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
        try {
            return await this.updateSiglUser.execute(id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        if (error instanceof SiglUsernameAlreadyInUseError) {
            throw new ConflictException(error.message);
        }
        if (error instanceof SiglUserNotFoundError) {
            throw new UnauthorizedException(error.message);
        }
        if (error instanceof InvalidCurrentPasswordError) {
            throw new BadRequestException(error.message);
        }
        throw error;
    }
}
