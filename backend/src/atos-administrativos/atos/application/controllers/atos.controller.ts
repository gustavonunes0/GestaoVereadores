import {
    BadRequestException,
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
import {
    ReadRoles,
    WriteRoles,
} from '../../../../common/decorators/api-roles.decorator';
import { SkipTenant } from '../../../../common/decorators/skip-tenant.decorator';
import { CreateAtoDto } from '../dto/create-ato.dto';
import { ListAtosQueryDto } from '../dto/list-atos-query.dto';
import { UpdateAtoDto } from '../dto/update-ato.dto';
import {
    AtoDataFinalAnteriorInicialError,
    AtoDataPublicacaoFinalAnteriorInicialError,
    AtoNotFoundError,
    AtoNumeroAlreadyInUseError,
    ClassificacaoAtoNotFoundError,
    TipoAtoNotFoundError,
} from '../errors/ato.errors';
import { CreateAtoUseCase } from '../use-cases/create-ato.use-case';
import { GetAtoByIdUseCase } from '../use-cases/get-ato-by-id.use-case';
import { ListAtosUseCase } from '../use-cases/list-atos.use-case';
import { RemoveAtoUseCase } from '../use-cases/remove-ato.use-case';
import { UpdateAtoUseCase } from '../use-cases/update-ato.use-case';

@ApiTags('atos')
@ApiBearerAuth()
@SkipTenant()
@Controller('atos')
export class AtosController {
    constructor(
        private readonly createAtoUseCase: CreateAtoUseCase,
        private readonly listAtosUseCase: ListAtosUseCase,
        private readonly getAtoByIdUseCase: GetAtoByIdUseCase,
        private readonly updateAtoUseCase: UpdateAtoUseCase,
        private readonly removeAtoUseCase: RemoveAtoUseCase,
    ) {}

    @ReadRoles()
    @Get()
    findAll(@Query() query: ListAtosQueryDto) {
        return this.listAtosUseCase.execute(query);
    }

    @ReadRoles()
    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            return await this.getAtoByIdUseCase.execute(id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @WriteRoles()
    @Post()
    async create(@Body() dto: CreateAtoDto) {
        try {
            return await this.createAtoUseCase.execute(dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @WriteRoles()
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateAtoDto) {
        try {
            return await this.updateAtoUseCase.execute(id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @WriteRoles()
    @Delete(':id')
    async remove(@Param('id') id: string) {
        try {
            return await this.removeAtoUseCase.execute(id);
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        if (error instanceof AtoNotFoundError) {
            throw new NotFoundException(error.message);
        }
        if (
            error instanceof TipoAtoNotFoundError ||
            error instanceof ClassificacaoAtoNotFoundError
        ) {
            throw new NotFoundException(error.message);
        }
        if (
            error instanceof AtoDataFinalAnteriorInicialError ||
            error instanceof AtoDataPublicacaoFinalAnteriorInicialError
        ) {
            throw new BadRequestException(error.message);
        }
        if (error instanceof AtoNumeroAlreadyInUseError) {
            throw new ConflictException(error.message);
        }
        throw error;
    }
}
