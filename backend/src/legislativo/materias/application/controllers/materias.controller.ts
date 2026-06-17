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
import { TenantRoles } from '../../../../common/decorators/tenant-roles.decorator';
import { TenantId } from '../../../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../../../auth/decorators/current-user.decorator';
import {
    ADMIN_ONLY,
    ALL_AUTHENTICATED,
    STAFF_AND_ABOVE,
} from '../../../../auth/guards/guard-combos';
import { AuthenticatedUser } from '../../../../common/types/authenticated-request';
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
import { TramitarMateriaDto } from '../dto/tramitar-materia.dto';
import { CreatePublicacaoDto } from '../dto/create-publicacao.dto';
import { TramitarMateriaUseCase } from '../use-cases/tramitar-materia.use-case';
import { AddPublicacaoMateriaUseCase } from '../use-cases/add-publicacao-materia.use-case';
import { ListAutoresExternosUseCase } from '../use-cases/list-autores-externos.use-case';
import { ListMatterAuthorOptionsUseCase } from '../use-cases/list-matter-author-options.use-case';
import { UploadMatterTextoOriginalUseCase } from '../use-cases/upload-matter-texto-original.use-case';
import { Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { RequestWithTenant } from '../../../../common/types/authenticated-request';

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
        private readonly tramitarMateria: TramitarMateriaUseCase,
        private readonly addPublicacao: AddPublicacaoMateriaUseCase,
        private readonly listAutoresExternos: ListAutoresExternosUseCase,
        private readonly listMatterAuthorOptions: ListMatterAuthorOptionsUseCase,
        private readonly uploadMatterTextoOriginal: UploadMatterTextoOriginalUseCase,
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

    @TenantRoles(...STAFF_AND_ABOVE)
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

    @TenantRoles(...STAFF_AND_ABOVE)
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

    @TenantRoles(...STAFF_AND_ABOVE)
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

    @TenantRoles(...ADMIN_ONLY)
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

    @TenantRoles(...STAFF_AND_ABOVE)
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

    @TenantRoles(...ALL_AUTHENTICATED)
    @Post()
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateMateriaDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        try {
            return await this.createMateria.execute(tenantId, dto, user);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...ALL_AUTHENTICATED)
    @Post(':id/texto-original')
    async uploadTextoOriginal(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: FastifyRequest,
    ) {
        try {
            const file = await req.file();
            return await this.uploadMatterTextoOriginal.execute(
                tenantId,
                id,
                file,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...ADMIN_ONLY)
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

    @Get(':id/autores')
    listarAutores(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.listMateriaAutores.execute(tenantId, id);
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Post(':id/autores')
    adicionarAutor(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AdicionarMateriaAutorDto,
    ) {
        return this.addMateriaAutor.execute(tenantId, id, dto);
    }

    @TenantRoles(...ADMIN_ONLY)
    @Delete(':id/autores/:materiaAutorId')
    removerAutor(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('materiaAutorId', ParseUUIDPipe) materiaAutorId: string,
    ) {
        return this.removeMateriaAutor.execute(tenantId, id, materiaAutorId);
    }

    @TenantRoles(...STAFF_AND_ABOVE)
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

    @TenantRoles(...ADMIN_ONLY)
    @Delete(':id')
    remove(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.removeMateria.execute(tenantId, id);
    }

    // ── Novos endpoints (SPEC-001 / PROMPTS SESSÃO 2) ─────────────────────

    @Get('autores-externos')
    listarAutoresExternos(
        @TenantId() tenantId: string,
        @Query('tipoAutorId') tipoAutorId?: string,
    ) {
        return this.listAutoresExternos.execute(tenantId, tipoAutorId);
    }

    @Get('opcoes-autor')
    listarOpcoesAutor(
        @TenantId() tenantId: string,
        @Query('tipoAutorId') tipoAutorId: string,
    ) {
        return this.listMatterAuthorOptions.execute(tenantId, tipoAutorId);
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Post(':id/tramitar')
    async tramitar(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: TramitarMateriaDto,
        @Req() req: FastifyRequest & RequestWithTenant,
    ) {
        try {
            return await this.tramitarMateria.execute(
                tenantId,
                id,
                dto,
                req.user?.id,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get(':id/tramitacao')
    async listarHistoricoTramitacao(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            const materia = (await this.getMateriaById.execute(tenantId, id)) as {
                id: string;
            };
            return materia;
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Post(':id/publicacoes')
    async adicionarPublicacao(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: CreatePublicacaoDto,
    ) {
        try {
            return await this.addPublicacao.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
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
