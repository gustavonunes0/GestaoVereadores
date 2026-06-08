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
    Put,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantMaintainer } from '../../../../common/decorators/tenant-maintainer.decorator';
import { TenantId } from '../../../../common/decorators/tenant-id.decorator';
import { AdicionarMateriaAutorDto } from '../dto/materia-autor.dto';
import { CreateMateriaDto, FilterMateriaDto } from '../dto/materia.dto';
import {
    AddCoautorMateriaDto,
    SetAutorExternoDto,
    SetAutorParlamentarDto,
    SetRelatorMateriaDto,
} from '../dto/matter-autoria.dto';
import { UpdateMateriaDto } from '../dto/update-materia.dto';
import {
    GuestUserNotFoundForMatterError,
    MatterAuthorshipValidationError,
    MatterCoauthorAlreadyExistsError,
    MatterCoauthorNotFoundError,
    MatterEmentaRequiredError,
    MatterInvalidStatusTransitionError,
    MatterNotFoundError,
    MatterStatusChangeViaUpdateNotAllowedError,
    MatterTramitationActionNotAllowedError,
    ParliamentarianNotFoundForMatterError,
    TipoAutorNotFoundForMatterError,
} from '../errors/matter.errors';
import { AddMateriaAutorUseCase } from '../use-cases/add-materia-autor.use-case';
import { CreateMateriaUseCase } from '../use-cases/create-materia.use-case';
import { ExecuteMatterTramitationUseCase } from '../use-cases/execute-matter-tramitation.use-case';
import { GetMateriaByIdUseCase } from '../use-cases/get-materia-by-id.use-case';
import { GetMatterAuthorshipUseCase } from '../use-cases/get-matter-authorship.use-case';
import { GetMatterWorkflowUseCase } from '../use-cases/get-matter-workflow.use-case';
import {
    AddMatterCoauthorUseCase,
    RemoveMatterCoauthorUseCase,
} from '../use-cases/manage-matter-coauthors.use-case';
import { SetMatterAutorExternoUseCase } from '../use-cases/set-matter-autor-externo.use-case';
import { SetMatterAutorParlamentarUseCase } from '../use-cases/set-matter-autor-parlamentar.use-case';
import { SetMatterRelatorUseCase } from '../use-cases/set-matter-relator.use-case';
import { ListMateriaAutoresUseCase } from '../use-cases/list-materia-autores.use-case';
import { ListMateriasUseCase } from '../use-cases/list-materias.use-case';
import { ListMatterStatusesUseCase } from '../use-cases/list-matter-statuses.use-case';
import { ListMatterTramitationActionsUseCase } from '../use-cases/list-matter-tramitation-actions.use-case';
import { RemoveMateriaAutorUseCase } from '../use-cases/remove-materia-autor.use-case';
import { RemoveMateriaUseCase } from '../use-cases/remove-materia.use-case';
import { UpdateMateriaUseCase } from '../use-cases/update-materia.use-case';
import { ExecutarTramitacaoMateriaDto } from '../dto/matter-tramitation.dto';

@ApiTags('legislative-materias')
@ApiBearerAuth()
@Controller('legislative/materias')
export class MateriasController {
    constructor(
        private readonly listMaterias: ListMateriasUseCase,
        private readonly getMateriaById: GetMateriaByIdUseCase,
        private readonly createMateria: CreateMateriaUseCase,
        private readonly updateMateria: UpdateMateriaUseCase,
        private readonly listMateriaAutores: ListMateriaAutoresUseCase,
        private readonly addMateriaAutor: AddMateriaAutorUseCase,
        private readonly removeMateriaAutor: RemoveMateriaAutorUseCase,
        private readonly executeTramitacao: ExecuteMatterTramitationUseCase,
        private readonly listTramitationActions: ListMatterTramitationActionsUseCase,
        private readonly removeMateria: RemoveMateriaUseCase,
        private readonly listMatterStatuses: ListMatterStatusesUseCase,
        private readonly getMatterWorkflow: GetMatterWorkflowUseCase,
        private readonly getMatterAuthorship: GetMatterAuthorshipUseCase,
        private readonly setAutorParlamentar: SetMatterAutorParlamentarUseCase,
        private readonly setAutorExterno: SetMatterAutorExternoUseCase,
        private readonly addCoautor: AddMatterCoauthorUseCase,
        private readonly removeCoautor: RemoveMatterCoauthorUseCase,
        private readonly setRelator: SetMatterRelatorUseCase,
    ) {}

    @Get('status')
    listStatuses() {
        return this.listMatterStatuses.execute();
    }

    @Get()
    findAll(@TenantId() tenantId: string, @Query() filters: FilterMateriaDto) {
        return this.listMaterias.execute(tenantId, filters);
    }

    @Get(':id/fluxo')
    async getFluxo(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.getMatterWorkflow.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get(':id/autoria')
    async getAutoria(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.getMatterAuthorship.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Put(':id/autoria/autor-parlamentar')
    async definirAutorParlamentar(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: SetAutorParlamentarDto,
    ) {
        try {
            return await this.setAutorParlamentar.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Put(':id/autoria/autor-externo')
    async definirAutorExterno(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: SetAutorExternoDto,
    ) {
        try {
            return await this.setAutorExterno.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Post(':id/autoria/coautores')
    async adicionarCoautor(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AddCoautorMateriaDto,
    ) {
        try {
            return await this.addCoautor.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Delete(':id/autoria/coautores/:coauthorId')
    async removerCoautor(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('coauthorId', ParseUUIDPipe) coauthorId: string,
    ) {
        try {
            return await this.removeCoautor.execute(
                tenantId,
                id,
                coauthorId,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Put(':id/autoria/relator')
    async definirRelator(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: SetRelatorMateriaDto,
    ) {
        try {
            return await this.setRelator.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get(':id/tramitacao/acoes')
    async listarAcoesTramitacao(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.listTramitationActions.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get(':id')
    async findOne(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.getMateriaById.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Post()
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateMateriaDto,
    ) {
        try {
            return await this.createMateria.execute(tenantId, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Patch(':id')
    async update(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateMateriaDto,
    ) {
        try {
            return await this.updateMateria.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Get(':id/autores')
    listarAutores(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.listMateriaAutores.execute(tenantId, id);
    }

    @TenantMaintainer()
    @Post(':id/autores')
    adicionarAutor(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AdicionarMateriaAutorDto,
    ) {
        return this.addMateriaAutor.execute(tenantId, id, dto);
    }

    @TenantMaintainer()
    @Delete(':id/autores/:materiaAutorId')
    removerAutor(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('materiaAutorId', ParseUUIDPipe) materiaAutorId: string,
    ) {
        return this.removeMateriaAutor.execute(tenantId, id, materiaAutorId);
    }

    @TenantMaintainer()
    @Post(':id/tramitacao')
    async executarTramitacao(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: ExecutarTramitacaoMateriaDto,
    ) {
        try {
            return await this.executeTramitacao.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Delete(':id')
    remove(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.removeMateria.execute(tenantId, id);
    }

    private handleError(error: unknown): never {
        if (
            error instanceof MatterNotFoundError ||
            error instanceof ParliamentarianNotFoundForMatterError ||
            error instanceof GuestUserNotFoundForMatterError ||
            error instanceof TipoAutorNotFoundForMatterError ||
            error instanceof MatterCoauthorNotFoundError
        ) {
            throw new NotFoundException(
                error instanceof Error ? error.message : 'Não encontrado',
            );
        }
        if (error instanceof MatterCoauthorAlreadyExistsError) {
            throw new ConflictException(error.message);
        }
        if (
            error instanceof MatterInvalidStatusTransitionError ||
            error instanceof MatterEmentaRequiredError ||
            error instanceof MatterAuthorshipValidationError ||
            error instanceof MatterStatusChangeViaUpdateNotAllowedError ||
            error instanceof MatterTramitationActionNotAllowedError
        ) {
            throw new BadRequestException(error.message);
        }
        throw error;
    }
}
