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
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantRoles } from '../../../../common/decorators/tenant-roles.decorator';
import { TenantId } from '../../../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../../../auth/decorators/current-user.decorator';
import {
    ADMIN_ONLY,
    STAFF_AND_ABOVE,
} from '../../../../auth/guards/guard-combos';
import { ParlamentarianGuard } from '../../../../auth/guards/parliamentarian.guard';
import {
    AuthenticatedUser,
    isParlamentarianUser,
} from '../../../../common/types/authenticated-request';
import { CreateParliamentarianDto } from '../dto/create-parliamentarian.dto';
import { GrantParliamentarianAccessDto } from '../dto/grant-parliamentarian-access.dto';
import { ListParliamentariansQueryDto } from '../dto/list-parliamentarians-query.dto';
import { UpdateParliamentarianDto } from '../dto/update-parliamentarian.dto';
import {
    ParliamentarianAccessAlreadyGrantedError,
    ParliamentarianAccessNotFoundError,
} from '../errors/parliamentarian-access.errors';
import {
    ParliamentarianAccessRequiredForPartyError,
    ParliamentarianCpfAlreadyInUseError,
    ParliamentarianEmailAlreadyInUseError,
    ParliamentarianNotFoundError,
    PoliticalPartyNotFoundForParliamentarianError,
    PoliticalPartyRemovedForParliamentarianError,
} from '../errors/parliamentarian.errors';
import { CreateParliamentarianUseCase } from '../use-cases/create-parliamentarian.use-case';
import { GetParliamentarianByIdUseCase } from '../use-cases/get-parliamentarian-by-id.use-case';
import { GetParliamentarianProfileUseCase } from '../use-cases/get-parliamentarian-profile.use-case';
import { GrantParliamentarianAccessUseCase } from '../use-cases/grant-parliamentarian-access.use-case';
import { ListParliamentariansUseCase } from '../use-cases/list-parliamentarians.use-case';
import { RemoveParliamentarianUseCase } from '../use-cases/remove-parliamentarian.use-case';
import { RevokeParliamentarianAccessUseCase } from '../use-cases/revoke-parliamentarian-access.use-case';
import { UpdateParliamentarianUseCase } from '../use-cases/update-parliamentarian.use-case';
import { ParliamentarianViewModel } from '../view-models/parliamentarian.view-model';

@ApiTags('legislative-parlamentares')
@ApiBearerAuth()
@Controller('legislative/parlamentares')
export class ParliamentariansController {
    constructor(
        private readonly createParliamentarianUseCase: CreateParliamentarianUseCase,
        private readonly listParliamentariansUseCase: ListParliamentariansUseCase,
        private readonly getParliamentarianByIdUseCase: GetParliamentarianByIdUseCase,
        private readonly getParliamentarianProfileUseCase: GetParliamentarianProfileUseCase,
        private readonly grantParliamentarianAccessUseCase: GrantParliamentarianAccessUseCase,
        private readonly revokeParliamentarianAccessUseCase: RevokeParliamentarianAccessUseCase,
        private readonly updateParliamentarianUseCase: UpdateParliamentarianUseCase,
        private readonly removeParliamentarianUseCase: RemoveParliamentarianUseCase,
    ) {}

    @Get('me/perfil')
    @UseGuards(ParlamentarianGuard)
    async myProfile(
        @TenantId() tenantId: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        if (!isParlamentarianUser(user)) {
            throw new NotFoundException('Parlamentar não encontrado');
        }
        try {
            return await this.getParliamentarianProfileUseCase.execute(
                tenantId,
                user.parliamentarianId,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Get()
    list(
        @TenantId() tenantId: string,
        @Query() query: ListParliamentariansQueryDto,
    ) {
        return this.listParliamentariansUseCase.execute(tenantId, query);
    }

    @TenantRoles(...STAFF_AND_ABOVE)
    @Get(':id')
    async getById(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.getParliamentarianByIdUseCase.execute(
                tenantId,
                id,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...ADMIN_ONLY)
    @Post()
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateParliamentarianDto,
    ) {
        try {
            return await this.createParliamentarianUseCase.execute(
                tenantId,
                dto,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...ADMIN_ONLY)
    @Post(':id/acesso')
    async grantAccess(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: GrantParliamentarianAccessDto,
    ) {
        try {
            const updated = await this.grantParliamentarianAccessUseCase.execute(
                tenantId,
                id,
                dto,
            );
            return ParliamentarianViewModel.toHttp(updated);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...ADMIN_ONLY)
    @Delete(':id/acesso')
    async revokeAccess(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            const updated =
                await this.revokeParliamentarianAccessUseCase.execute(
                    tenantId,
                    id,
                );
            return ParliamentarianViewModel.toHttp(updated);
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...ADMIN_ONLY)
    @Patch(':id')
    async update(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateParliamentarianDto,
    ) {
        try {
            return await this.updateParliamentarianUseCase.execute(
                tenantId,
                id,
                dto,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantRoles(...ADMIN_ONLY)
    @Delete(':id')
    async remove(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        try {
            return await this.removeParliamentarianUseCase.execute(tenantId, id);
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        if (error instanceof ParliamentarianNotFoundError) {
            throw new NotFoundException(error.message);
        }
        if (
            error instanceof PoliticalPartyNotFoundForParliamentarianError ||
            error instanceof PoliticalPartyRemovedForParliamentarianError
        ) {
            throw new NotFoundException(error.message);
        }
        if (
            error instanceof ParliamentarianCpfAlreadyInUseError ||
            error instanceof ParliamentarianEmailAlreadyInUseError ||
            error instanceof ParliamentarianAccessAlreadyGrantedError
        ) {
            throw new ConflictException(error.message);
        }
        if (error instanceof ParliamentarianAccessNotFoundError) {
            throw new NotFoundException(error.message);
        }
        if (error instanceof ParliamentarianAccessRequiredForPartyError) {
            throw new BadRequestException(error.message);
        }
        if (error instanceof Error && error.message.includes('Informe userId')) {
            throw new BadRequestException(error.message);
        }
        throw error;
    }
}
