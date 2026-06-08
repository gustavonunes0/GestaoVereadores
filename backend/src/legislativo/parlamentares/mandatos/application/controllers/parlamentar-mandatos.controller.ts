import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    Get,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantMaintainer } from '../../../../../common/decorators/tenant-maintainer.decorator';
import { TenantId } from '../../../../../common/decorators/tenant-id.decorator';
import { CreateParlamentarMandatoDto } from '../dto/create-parlamentar-mandato.dto';
import { FinishParlamentarMandatoDto } from '../dto/finish-parlamentar-mandato.dto';
import { ListParlamentarMandatosQueryDto } from '../dto/list-parlamentar-mandatos-query.dto';
import {
    ActiveParlamentarMandatoAlreadyExistsError,
    LegislatureNotFoundForMandateError,
    ParlamentarMandatoAlreadyFinishedError,
    ParlamentarMandatoInvalidDateRangeError,
    ParlamentarMandatoInvalidFinishStatusError,
    ParlamentarMandatoNotFoundError,
    ParliamentarianNotFoundForMandateError,
} from '../errors/parlamentar-mandato.errors';
import { CreateParlamentarMandatoUseCase } from '../use-cases/create-parlamentar-mandato.use-case';
import { FinishParlamentarMandatoUseCase } from '../use-cases/finish-parlamentar-mandato.use-case';
import { ListParlamentarMandatosUseCase } from '../use-cases/list-parlamentar-mandatos.use-case';

@ApiTags('legislative-parlamentares-mandatos')
@ApiBearerAuth()
@Controller('legislative/parlamentares/:parliamentarianId/mandatos')
export class ParlamentarMandatosController {
    constructor(
        private readonly createParlamentarMandatoUseCase: CreateParlamentarMandatoUseCase,
        private readonly listParlamentarMandatosUseCase: ListParlamentarMandatosUseCase,
        private readonly finishParlamentarMandatoUseCase: FinishParlamentarMandatoUseCase,
    ) {}

    @Get()
    list(
        @TenantId() tenantId: string,
        @Param('parliamentarianId', ParseUUIDPipe) parliamentarianId: string,
        @Query() query: ListParlamentarMandatosQueryDto,
    ) {
        return this.listParlamentarMandatosUseCase.execute(
            tenantId,
            parliamentarianId,
            query,
        );
    }

    @TenantMaintainer()
    @Post()
    async create(
        @TenantId() tenantId: string,
        @Param('parliamentarianId', ParseUUIDPipe) parliamentarianId: string,
        @Body() dto: CreateParlamentarMandatoDto,
    ) {
        try {
            return await this.createParlamentarMandatoUseCase.execute(
                tenantId,
                parliamentarianId,
                dto,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    @TenantMaintainer()
    @Patch(':mandateId/finish')
    async finish(
        @TenantId() tenantId: string,
        @Param('parliamentarianId', ParseUUIDPipe) parliamentarianId: string,
        @Param('mandateId', ParseUUIDPipe) mandateId: string,
        @Body() dto: FinishParlamentarMandatoDto,
    ) {
        try {
            return await this.finishParlamentarMandatoUseCase.execute(
                tenantId,
                parliamentarianId,
                mandateId,
                dto,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        if (
            error instanceof ParliamentarianNotFoundForMandateError ||
            error instanceof LegislatureNotFoundForMandateError ||
            error instanceof ParlamentarMandatoNotFoundError
        ) {
            throw new NotFoundException(error.message);
        }
        if (error instanceof ActiveParlamentarMandatoAlreadyExistsError) {
            throw new ConflictException(error.message);
        }
        if (
            error instanceof ParlamentarMandatoAlreadyFinishedError ||
            error instanceof ParlamentarMandatoInvalidDateRangeError ||
            error instanceof ParlamentarMandatoInvalidFinishStatusError
        ) {
            throw new BadRequestException(error.message);
        }
        throw error;
    }
}
