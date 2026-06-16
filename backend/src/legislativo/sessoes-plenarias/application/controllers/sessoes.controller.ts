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
    Query,
    Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantMaintainer } from '../../../../common/decorators/tenant-maintainer.decorator';
import { TenantRoles } from '../../../../common/decorators/tenant-roles.decorator';
import { TenantId } from '../../../../common/decorators/tenant-id.decorator';
import {
    ADMIN_ONLY,
    PARLIAMENTARIAN_ONLY,
    STAFF_AND_ABOVE,
} from '../../../../auth/guards/guard-combos';
import {
    AddPautaItemDto,
    CreateSessaoPlenariaDto,
    FilterSessaoPlenariaDto,
    RegistrarResultadoPautaDto,
} from '../dto/sessao.dto';
import {
    FilterPresencaDto,
    RegistrarPresencaDto,
    UpdatePresencaDto,
} from '../dto/presenca.dto';
import { FilterPautaDto, UpdatePautaItemDto } from '../dto/pauta.dto';
import { ExecutarCicloVidaSessaoDto } from '../dto/session-lifecycle.dto';
import { UpdateSessaoPlenariaDto } from '../dto/update-sessao.dto';
import {
    AbrirVotacaoDto,
    FinalizarVotacaoDto,
} from '../../../votacoes/application/dto/votacao.dto';
import {
    FilterVotoDto,
    RegistrarVotoDto,
    UpdateVotoDto,
} from '../../../votacoes/application/dto/voto.dto';
import {
    VotacaoJaExisteError,
    VotacaoJaFinalizadaError,
    VotacaoMateriaNaoNaPautaError,
    VotacaoMateriaNotFoundError,
    VotacaoNotFoundError,
    VotacaoParlamentarNotFoundError,
    VotacaoPautaItemNotFoundError,
    VotacaoQuorumNaoAtingidoError,
    VotacaoSessaoInvalidaError,
    VotacaoSessaoNotFoundError,
    VotacaoTipoSimbolicaError,
    VotacaoTotaisSimbolicaObrigatoriosError,
} from '../../../votacoes/application/errors/votacao.errors';
import {
    VotoDuplicadoError,
    VotoMandatoInativoError,
    VotoNotFoundError,
    VotoParlamentarAusenteError,
    VotoParlamentarNotFoundError,
    VotoTipoSimbolicaError,
    VotoVotacaoEncerradaError,
} from '../../../votacoes/application/errors/voto.errors';
import { ResultadoManualNaoPermitidoError } from '../../../votacoes/application/errors/resultado.errors';
import {
    AbrirVotacaoUseCase,
    FinalizarVotacaoUseCase,
    ObterVotacaoUseCase,
} from '../../../votacoes/application/use-cases/votacao.use-case';
import { PreviewResultadoVotacaoUseCase } from '../../../votacoes/application/use-cases/resultado.use-case';
import {
    GetVotoByIdUseCase,
    ListVotosUseCase,
    RegistrarVotoUseCase,
    UpdateVotoUseCase,
} from '../../../votacoes/application/use-cases/voto.use-case';
import {
    PautaItemComVotacaoAbertaError,
    PautaItemNotFoundError,
    PautaMateriaDuplicadaError,
    PautaMateriaNaoNaPautaError,
    PautaMateriaNotFoundError,
    PautaOrdemEmUsoError,
    PautaSessaoNaoAceitaAlteracaoError,
} from '../errors/pauta.errors';
import {
    PresencaDuplicadaError,
    PresencaJustificativaObrigatoriaError,
    PresencaMandatoInativoError,
    PresencaNotFoundError,
    PresencaParlamentarNotFoundError,
    PresencaSessaoEncerradaError,
} from '../errors/presenca.errors';
import {
    SessaoInvalidDateRangeError,
    SessaoLifecycleActionNotAllowedError,
    SessaoPlenariaNotFoundError,
    SessaoStatusChangeViaUpdateNotAllowedError,
    SessaoTipoNotFoundError,
} from '../errors/sessao.errors';
import { CreateSessaoPlenariaUseCase } from '../use-cases/create-sessao-plenaria.use-case';
import {
    AddPautaItemUseCase,
    GetPautaItemByIdUseCase,
    ListPautaFasesUseCase,
    ListPautaItensUseCase,
    RemovePautaItemUseCase,
    UpdatePautaItemUseCase,
} from '../use-cases/pauta.use-case';
import { GetSessaoPlenariaByIdUseCase } from '../use-cases/get-sessao-plenaria-by-id.use-case';
import { ListSessoesPlenariasUseCase } from '../use-cases/list-sessoes-plenarias.use-case';
import {
    GetPresencaByIdUseCase,
    ListPresencaSituacoesUseCase,
    ListPresencasUseCase,
    RegistrarPresencaUseCase,
    UpdatePresencaUseCase,
} from '../use-cases/presenca.use-case';
import { RegistrarResultadoPautaUseCase } from '../use-cases/registrar-resultado-pauta.use-case';
import { RemoveSessaoPlenariaUseCase } from '../use-cases/remove-sessao-plenaria.use-case';
import {
    ExecuteSessionLifecycleUseCase,
    GetSessionWorkflowUseCase,
    ListSessionLifecycleActionsUseCase,
    ListSessionStatusesUseCase,
} from '../use-cases/session-lifecycle.use-case';
import { UpdateSessaoPlenariaUseCase } from '../use-cases/update-sessao-plenaria.use-case';
import { AbrirSessaoUseCase } from '../use-cases/abrir-sessao.use-case';
import { SuspenderSessaoUseCase } from '../use-cases/suspender-sessao.use-case';
import { EncerrarSessaoUseCase } from '../use-cases/encerrar-sessao.use-case';
import { CancelarSessaoUseCase } from '../use-cases/cancelar-sessao.use-case';
import { PublicarPautaUseCase } from '../use-cases/publicar-pauta.use-case';
import { CalcularQuorumUseCase } from '../use-cases/calcular-quorum.use-case';
import { AbrirSessaoDto } from '../dto/abrir-sessao.dto';
import { SuspenderSessaoDto } from '../dto/suspender-sessao.dto';
import { EncerrarSessaoDto } from '../dto/encerrar-sessao.dto';
import { CancelarSessaoDto } from '../dto/cancelar-sessao.dto';

@ApiTags('sessoes')
@ApiBearerAuth()
@Controller('legislative/sessoes-plenarias')
export class SessoesController {
    constructor(
        private readonly listSessoesPlenarias: ListSessoesPlenariasUseCase,
        private readonly getSessaoPlenariaById: GetSessaoPlenariaByIdUseCase,
        private readonly createSessaoPlenaria: CreateSessaoPlenariaUseCase,
        private readonly updateSessaoPlenaria: UpdateSessaoPlenariaUseCase,
        private readonly removeSessaoPlenaria: RemoveSessaoPlenariaUseCase,
        private readonly listSessionStatuses: ListSessionStatusesUseCase,
        private readonly getSessionWorkflow: GetSessionWorkflowUseCase,
        private readonly listLifecycleActions: ListSessionLifecycleActionsUseCase,
        private readonly executeLifecycle: ExecuteSessionLifecycleUseCase,
        private readonly listPautaItens: ListPautaItensUseCase,
        private readonly getPautaItemById: GetPautaItemByIdUseCase,
        private readonly listPautaFases: ListPautaFasesUseCase,
        private readonly addPautaItem: AddPautaItemUseCase,
        private readonly updatePautaItem: UpdatePautaItemUseCase,
        private readonly removePautaItem: RemovePautaItemUseCase,
        private readonly registrarResultadoPauta: RegistrarResultadoPautaUseCase,
        private readonly listPresencas: ListPresencasUseCase,
        private readonly getPresencaById: GetPresencaByIdUseCase,
        private readonly listPresencaSituacoes: ListPresencaSituacoesUseCase,
        private readonly registrarPresenca: RegistrarPresencaUseCase,
        private readonly updatePresenca: UpdatePresencaUseCase,
        private readonly obterVotacao: ObterVotacaoUseCase,
        private readonly abrirVotacao: AbrirVotacaoUseCase,
        private readonly listVotos: ListVotosUseCase,
        private readonly getVotoById: GetVotoByIdUseCase,
        private readonly registrarVoto: RegistrarVotoUseCase,
        private readonly updateVoto: UpdateVotoUseCase,
        private readonly previewResultadoVotacao: PreviewResultadoVotacaoUseCase,
        private readonly finalizarVotacao: FinalizarVotacaoUseCase,
        private readonly abrirSessao: AbrirSessaoUseCase,
        private readonly suspenderSessao: SuspenderSessaoUseCase,
        private readonly encerrarSessao: EncerrarSessaoUseCase,
        private readonly cancelarSessao: CancelarSessaoUseCase,
        private readonly publicarPauta: PublicarPautaUseCase,
        private readonly calcularQuorum: CalcularQuorumUseCase,
    ) {}

    @Get('pauta/fases')
    listFasesPauta() {
        return this.listPautaFases.execute();
    }

    @Get('presenca/situacoes')
    listSituacoesPresenca() {
        return this.listPresencaSituacoes.execute();
    }

    @Get('situacoes')
    listSituacoes() {
        return this.listSessionStatuses.execute();
    }

    @Get()
    findAll(
        @TenantId() tenantId: string,
        @Query() filters: FilterSessaoPlenariaDto,
    ) {
        return this.listSessoesPlenarias.execute(tenantId, filters);
    }

    @Get(':id/fluxo')
    async getFluxo(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.getSessionWorkflow.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get(':id/ciclo-vida/acoes')
    async listarAcoesCicloVida(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.listLifecycleActions.execute(tenantId, id);
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
            return await this.getSessaoPlenariaById.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...ADMIN_ONLY)
    @Post()
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateSessaoPlenariaDto,
    ) {
        try {
            return await this.createSessaoPlenaria.execute(tenantId, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...ADMIN_ONLY)
    @Patch(':id')
    async update(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateSessaoPlenariaDto,
    ) {
        try {
            return await this.updateSessaoPlenaria.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Post(':id/ciclo-vida')
    async executarCicloVida(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: ExecutarCicloVidaSessaoDto,
    ) {
        try {
            return await this.executeLifecycle.execute(tenantId, id, dto);
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
        return this.removeSessaoPlenaria.execute(tenantId, id);
    }

    @Get(':id/pauta')
    async listPauta(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Query() filters: FilterPautaDto,
    ) {
        try {
            return await this.listPautaItens.execute(tenantId, id, filters);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get(':id/pauta/:pautaItemId')
    async getPautaItem(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('pautaItemId', ParseUUIDPipe) pautaItemId: string,
    ) {
        try {
            return await this.getPautaItemById.execute(
                tenantId,
                id,
                pautaItemId,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Post(':id/pauta')
    async addPauta(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AddPautaItemDto,
    ) {
        try {
            return await this.addPautaItem.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Patch(':id/pauta/:pautaItemId')
    async updatePautaItemHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('pautaItemId', ParseUUIDPipe) pautaItemId: string,
        @Body() dto: UpdatePautaItemDto,
    ) {
        try {
            return await this.updatePautaItem.execute(
                tenantId,
                id,
                pautaItemId,
                dto,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Delete(':id/pauta/:pautaItemId')
    async removerPauta(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('pautaItemId', ParseUUIDPipe) pautaItemId: string,
    ) {
        try {
            return await this.removePautaItem.execute(
                tenantId,
                id,
                pautaItemId,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Patch(':id/pauta/:pautaItemId/resultado')
    registrarResultadoPautaHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('pautaItemId', ParseUUIDPipe) pautaItemId: string,
        @Body() dto: RegistrarResultadoPautaDto,
    ) {
        return this.registrarResultadoPauta.execute(
            tenantId,
            id,
            pautaItemId,
            dto,
        );
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Post(':id/presencas')
    async registrarPresencaHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: RegistrarPresencaDto,
    ) {
        try {
            return await this.registrarPresenca.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get(':id/presencas')
    async listPresencasHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Query() filters: FilterPresencaDto,
    ) {
        try {
            return await this.listPresencas.execute(tenantId, id, filters);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get(':id/presencas/:presencaId')
    async getPresencaHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('presencaId', ParseUUIDPipe) presencaId: string,
    ) {
        try {
            return await this.getPresencaById.execute(tenantId, id, presencaId);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Patch(':id/presencas/:presencaId')
    async updatePresencaHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('presencaId', ParseUUIDPipe) presencaId: string,
        @Body() dto: UpdatePresencaDto,
    ) {
        try {
            return await this.updatePresenca.execute(
                tenantId,
                id,
                presencaId,
                dto,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get(':id/pauta/:pautaItemId/votacao')
    async obterVotacaoHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('pautaItemId', ParseUUIDPipe) pautaItemId: string,
    ) {
        try {
            return await this.obterVotacao.execute(tenantId, id, pautaItemId);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Post(':id/pauta/:pautaItemId/votacao')
    async abrirVotacaoHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('pautaItemId', ParseUUIDPipe) pautaItemId: string,
        @Body() dto: AbrirVotacaoDto,
    ) {
        try {
            return await this.abrirVotacao.execute(
                tenantId,
                id,
                pautaItemId,
                dto,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get(':id/pauta/:pautaItemId/votacao/votos')
    async listVotosHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('pautaItemId', ParseUUIDPipe) pautaItemId: string,
        @Query() filters: FilterVotoDto,
    ) {
        try {
            return await this.listVotos.execute(
                tenantId,
                id,
                pautaItemId,
                filters,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get(':id/pauta/:pautaItemId/votacao/votos/:votoId')
    async getVotoHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('pautaItemId', ParseUUIDPipe) pautaItemId: string,
        @Param('votoId', ParseUUIDPipe) votoId: string,
    ) {
        try {
            return await this.getVotoById.execute(
                tenantId,
                id,
                pautaItemId,
                votoId,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...PARLIAMENTARIAN_ONLY)
    @Post(':id/pauta/:pautaItemId/votacao/votos')
    async registrarVotoHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('pautaItemId', ParseUUIDPipe) pautaItemId: string,
        @Body() dto: RegistrarVotoDto,
    ) {
        try {
            return await this.registrarVoto.execute(
                tenantId,
                id,
                pautaItemId,
                dto,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Patch(':id/pauta/:pautaItemId/votacao/votos/:votoId')
    async updateVotoHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('pautaItemId', ParseUUIDPipe) pautaItemId: string,
        @Param('votoId', ParseUUIDPipe) votoId: string,
        @Body() dto: UpdateVotoDto,
    ) {
        try {
            return await this.updateVoto.execute(
                tenantId,
                id,
                pautaItemId,
                votoId,
                dto,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get(':id/pauta/:pautaItemId/votacao/resultado')
    async previewResultadoVotacaoHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('pautaItemId', ParseUUIDPipe) pautaItemId: string,
        @Query() dto: FinalizarVotacaoDto,
    ) {
        try {
            return await this.previewResultadoVotacao.execute(
                tenantId,
                id,
                pautaItemId,
                dto,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Patch(':id/pauta/:pautaItemId/votacao/finalizar')
    async finalizarVotacaoHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('pautaItemId', ParseUUIDPipe) pautaItemId: string,
        @Body() dto: FinalizarVotacaoDto,
    ) {
        try {
            return await this.finalizarVotacao.execute(
                tenantId,
                id,
                pautaItemId,
                dto,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Post(':id/abrir')
    abrirSessaoHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AbrirSessaoDto,
        @Req() req: Request,
    ) {
        const responsavelId = (req.user as { id?: string })?.id ?? 'system';
        return this.abrirSessao.execute(tenantId, id, dto, responsavelId);
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Post(':id/suspender')
    suspenderSessaoHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: SuspenderSessaoDto,
        @Req() req: Request,
    ) {
        const responsavelId = (req.user as { id?: string })?.id ?? 'system';
        return this.suspenderSessao.execute(tenantId, id, dto, responsavelId);
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Post(':id/encerrar')
    encerrarSessaoHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: EncerrarSessaoDto,
        @Req() req: Request,
    ) {
        const responsavelId = (req.user as { id?: string })?.id ?? 'system';
        return this.encerrarSessao.execute(tenantId, id, dto, responsavelId);
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Post(':id/cancelar')
    cancelarSessaoHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: CancelarSessaoDto,
        @Req() req: Request,
    ) {
        const responsavelId = (req.user as { id?: string })?.id ?? 'system';
        return this.cancelarSessao.execute(tenantId, id, dto, responsavelId);
    }

    @Get(':id/quorum')
    calcularQuorumHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.calcularQuorum.execute(tenantId, id);
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Patch(':id/pauta/publicar')
    publicarPautaHandler(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.publicarPauta.execute(tenantId, id);
    }

    private handleError(error: unknown): never {
        if (
            error instanceof SessaoPlenariaNotFoundError ||
            error instanceof SessaoTipoNotFoundError ||
            error instanceof PautaItemNotFoundError ||
            error instanceof PautaMateriaNotFoundError ||
            error instanceof PresencaNotFoundError ||
            error instanceof PresencaParlamentarNotFoundError ||
            error instanceof VotacaoNotFoundError ||
            error instanceof VotacaoPautaItemNotFoundError ||
            error instanceof VotacaoMateriaNotFoundError ||
            error instanceof VotacaoParlamentarNotFoundError ||
            error instanceof VotacaoSessaoNotFoundError ||
            error instanceof VotoNotFoundError ||
            error instanceof VotoParlamentarNotFoundError
        ) {
            throw new NotFoundException(
                error instanceof Error ? error.message : 'Não encontrado',
            );
        }
        if (
            error instanceof PautaMateriaDuplicadaError ||
            error instanceof PautaOrdemEmUsoError ||
            error instanceof PresencaDuplicadaError ||
            error instanceof VotacaoJaExisteError ||
            error instanceof VotoDuplicadoError
        ) {
            throw new ConflictException(
                error instanceof Error ? error.message : 'Conflito',
            );
        }
        if (
            error instanceof SessaoInvalidDateRangeError ||
            error instanceof SessaoStatusChangeViaUpdateNotAllowedError ||
            error instanceof SessaoLifecycleActionNotAllowedError ||
            error instanceof PautaSessaoNaoAceitaAlteracaoError ||
            error instanceof PautaMateriaNaoNaPautaError ||
            error instanceof PautaItemComVotacaoAbertaError ||
            error instanceof PresencaMandatoInativoError ||
            error instanceof PresencaJustificativaObrigatoriaError ||
            error instanceof PresencaSessaoEncerradaError ||
            error instanceof VotacaoSessaoInvalidaError ||
            error instanceof VotacaoMateriaNaoNaPautaError ||
            error instanceof VotacaoJaFinalizadaError ||
            error instanceof VotacaoTipoSimbolicaError ||
            error instanceof VotacaoTotaisSimbolicaObrigatoriosError ||
            error instanceof VotacaoQuorumNaoAtingidoError ||
            error instanceof VotoMandatoInativoError ||
            error instanceof VotoParlamentarAusenteError ||
            error instanceof VotoTipoSimbolicaError ||
            error instanceof VotoVotacaoEncerradaError ||
            error instanceof VotacaoJaFinalizadaError ||
            error instanceof ResultadoManualNaoPermitidoError
        ) {
            throw new BadRequestException(
                error instanceof Error ? error.message : 'Requisição inválida',
            );
        }
        throw error;
    }
}
