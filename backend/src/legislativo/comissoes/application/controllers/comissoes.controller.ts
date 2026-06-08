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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantMaintainer } from '../../../../common/decorators/tenant-maintainer.decorator';
import { TenantId } from '../../../../common/decorators/tenant-id.decorator';
import {
    AddMembroComissaoDto,
    CreateComissaoDto,
    ListComissoesQueryDto,
    UpdateComissaoDto,
} from '../dto/comissao.dto';
import {
    ComissaoAcronymAlreadyInUseError,
    ComissaoInvalidDateRangeError,
    ComissaoMembroNotFoundError,
    ComissaoNotFoundError,
    ComissaoPurposeRequiredError,
    CommitteeExclusiveRoleAlreadyAssignedError,
    ParliamentarianAlreadyOnCommitteeError,
    ParliamentarianNotFoundForComissaoError,
} from '../errors/comissao.errors';
import { AddComissaoMembroUseCase } from '../use-cases/add-comissao-membro.use-case';
import { CreateComissaoUseCase } from '../use-cases/create-comissao.use-case';
import { GetComissaoByIdUseCase } from '../use-cases/get-comissao-by-id.use-case';
import { ListComissoesUseCase } from '../use-cases/list-comissoes.use-case';
import { ListFuncoesComissaoUseCase } from '../use-cases/list-funcoes-comissao.use-case';
import { RemoveComissaoMembroUseCase } from '../use-cases/remove-comissao-membro.use-case';
import { RemoveComissaoUseCase } from '../use-cases/remove-comissao.use-case';
import { UpdateComissaoUseCase } from '../use-cases/update-comissao.use-case';

@ApiTags('legislative-comissoes')
@ApiBearerAuth()
@Controller('legislative/comissoes')
export class ComissoesController {
    constructor(
        private readonly listComissoes: ListComissoesUseCase,
        private readonly getComissaoById: GetComissaoByIdUseCase,
        private readonly createComissao: CreateComissaoUseCase,
        private readonly updateComissao: UpdateComissaoUseCase,
        private readonly removeComissao: RemoveComissaoUseCase,
        private readonly addComissaoMembro: AddComissaoMembroUseCase,
        private readonly removeComissaoMembro: RemoveComissaoMembroUseCase,
        private readonly listFuncoesComissao: ListFuncoesComissaoUseCase,
    ) {}

    @Get()
    findAll(
        @TenantId() tenantId: string,
        @Query() query: ListComissoesQueryDto,
    ) {
        return this.listComissoes.execute(tenantId, query);
    }

    @Get('funcoes')
    listFuncoes() {
        return this.listFuncoesComissao.execute();
    }

    @Get(':id')
    async findOne(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.getComissaoById.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Post()
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateComissaoDto,
    ) {
        try {
            return await this.createComissao.execute(tenantId, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Patch(':id')
    async update(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateComissaoDto,
    ) {
        try {
            return await this.updateComissao.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Delete(':id')
    async remove(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            await this.removeComissao.execute(tenantId, id);
            return { success: true };
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Post(':id/membros')
    async addMembro(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AddMembroComissaoDto,
    ) {
        try {
            return await this.addComissaoMembro.execute(tenantId, id, dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Delete(':id/membros/:membroId')
    async removeMembro(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('membroId', ParseUUIDPipe) membroId: string,
    ) {
        try {
            return await this.removeComissaoMembro.execute(
                tenantId,
                id,
                membroId,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        if (
            error instanceof ComissaoNotFoundError ||
            error instanceof ParliamentarianNotFoundForComissaoError ||
            error instanceof ComissaoMembroNotFoundError
        ) {
            throw new NotFoundException(error.message);
        }
        if (
            error instanceof ComissaoAcronymAlreadyInUseError ||
            error instanceof ParliamentarianAlreadyOnCommitteeError ||
            error instanceof CommitteeExclusiveRoleAlreadyAssignedError
        ) {
            throw new ConflictException(error.message);
        }
        if (
            error instanceof ComissaoInvalidDateRangeError ||
            error instanceof ComissaoPurposeRequiredError
        ) {
            throw new BadRequestException(error.message);
        }
        throw error;
    }
}
