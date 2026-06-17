import {
    Controller,
    Get,
    NotFoundException,
    Param,
    Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators/public.decorator';
import { SkipTenant } from '../../../common/decorators/skip-tenant.decorator';
import { FilterAgendaDto } from '../../../legislativo/agenda-legislativa/application/dto/agenda.dto';
import { ListNormasQueryDto } from '../../../controle-juridico/normas/application/dto/list-normas-query.dto';
import { ListParliamentariansQueryDto } from '../../../legislativo/parlamentares/application/dto/list-parliamentarians-query.dto';
import { ListComissoesQueryDto } from '../../../legislativo/comissoes/application/dto/comissao.dto';
import { ComissaoNotFoundError } from '../../../legislativo/comissoes/application/errors/comissao.errors';
import { ParliamentarianNotFoundError } from '../../../legislativo/parlamentares/application/errors/parliamentarian.errors';
import {
    PortalInactiveError,
    PortalNotFoundError,
} from '../../domain/errors/portal.errors';
import {
    GetPublicPortalConfigUseCase,
    ListPublicPortalAgendaUseCase,
} from '../use-cases/public-portal.use-cases';
import { ListPublicPortalNormasUseCase } from '../use-cases/list-public-portal-normas.use-case';
import { ListPublicPortalParlamentaresUseCase } from '../use-cases/list-public-portal-parlamentares.use-case';
import { GetPublicPortalParliamentarianUseCase } from '../use-cases/get-public-portal-parliamentarian.use-case';
import { GetPublicPortalMesaDiretoraUseCase } from '../use-cases/get-public-portal-mesa-diretora.use-case';
import { ListPublicPortalComissoesUseCase } from '../use-cases/list-public-portal-comissoes.use-case';
import { GetPublicPortalComissaoUseCase } from '../use-cases/get-public-portal-comissao.use-case';
import { GetPublicPortalTransmissaoUseCase } from '../use-cases/get-public-portal-transmissao.use-case';

@ApiTags('portal-public')
@Public()
@SkipTenant()
@Controller('public/:slug')
export class PortalPublicController {
    constructor(
        private readonly getPublicConfig: GetPublicPortalConfigUseCase,
        private readonly listPublicAgenda: ListPublicPortalAgendaUseCase,
        private readonly listPublicNormas: ListPublicPortalNormasUseCase,
        private readonly listPublicParlamentares: ListPublicPortalParlamentaresUseCase,
        private readonly getPublicParliamentarian: GetPublicPortalParliamentarianUseCase,
        private readonly getPublicMesaDiretora: GetPublicPortalMesaDiretoraUseCase,
        private readonly listPublicComissoes: ListPublicPortalComissoesUseCase,
        private readonly getPublicComissao: GetPublicPortalComissaoUseCase,
        private readonly getPublicTransmissao: GetPublicPortalTransmissaoUseCase,
    ) {}

    @Get('config')
    async getConfig(@Param('slug') slug: string) {
        try {
            return await this.getPublicConfig.execute(slug);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get('agenda')
    async getAgenda(
        @Param('slug') slug: string,
        @Query() query: FilterAgendaDto,
    ) {
        try {
            return await this.listPublicAgenda.execute(slug, query);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get('normas')
    async getNormas(
        @Param('slug') slug: string,
        @Query() query: ListNormasQueryDto,
    ) {
        try {
            return await this.listPublicNormas.execute(slug, query);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get('vereadores')
    async getVereadores(
        @Param('slug') slug: string,
        @Query() query: ListParliamentariansQueryDto,
    ) {
        try {
            return await this.listPublicParlamentares.execute(slug, query);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get('vereadores/:id')
    async getVereador(
        @Param('slug') slug: string,
        @Param('id') id: string,
    ) {
        try {
            return await this.getPublicParliamentarian.execute(slug, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get('mesa-diretora')
    async getMesaDiretora(@Param('slug') slug: string) {
        try {
            return await this.getPublicMesaDiretora.execute(slug);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get('comissoes')
    async getComissoes(
        @Param('slug') slug: string,
        @Query() query: ListComissoesQueryDto,
    ) {
        try {
            return await this.listPublicComissoes.execute(slug, query);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get('comissoes/:id')
    async getComissao(
        @Param('slug') slug: string,
        @Param('id') id: string,
    ) {
        try {
            return await this.getPublicComissao.execute(slug, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Get('transmissao')
    async getTransmissao(@Param('slug') slug: string) {
        try {
            return await this.getPublicTransmissao.execute(slug);
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        if (
            error instanceof PortalNotFoundError ||
            error instanceof PortalInactiveError ||
            error instanceof ParliamentarianNotFoundError ||
            error instanceof ComissaoNotFoundError
        ) {
            throw new NotFoundException(error.message);
        }
        throw error;
    }
}
