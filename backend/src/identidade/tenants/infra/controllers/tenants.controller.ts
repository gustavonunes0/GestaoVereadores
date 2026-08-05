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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PlatformOnly } from '../../../../common/decorators/platform-only.decorator';
import { SkipTenant } from '../../../../common/decorators/skip-tenant.decorator';
import { CreateTenantDto } from '../../application/dtos/requests/create-tenant.request';
import { ProvisionTenantDto } from '../../application/dtos/requests/provision-tenant.request';
import {
    CreateTenantPaymentDto,
    UpdateTenantPaymentDto,
} from '../../application/dtos/requests/tenant-payment.request';
import { UpdateTenantDto } from '../../application/dtos/requests/update-tenant.request';
import { TenantCnpjAlreadyInUseError } from '../../application/errors/tenant-cnpj-already-in-use.error';
import { TenantNotFoundError } from '../../application/errors/tenant-not-found.error';
import { CreateTenantPaymentUseCase } from '../../application/use-cases/create-tenant-payment.use-case';
import { CreateTenantUseCase } from '../../application/use-cases/create-tenant.use-case';
import { DeleteTenantPaymentUseCase } from '../../application/use-cases/delete-tenant-payment.use-case';
import { DeleteTenantUseCase } from '../../application/use-cases/delete-tenant.use-case';
import { GetTenantDetailUseCase } from '../../application/use-cases/get-tenant-detail.use-case';
import { ListTenantPaymentsUseCase } from '../../application/use-cases/list-tenant-payments.use-case';
import { ListTenantsWithStatsUseCase } from '../../application/use-cases/list-tenants-with-stats.use-case';
import { ProvisionTenantUseCase } from '../../application/use-cases/provision-tenant.use-case';
import { UpdateTenantPaymentUseCase } from '../../application/use-cases/update-tenant-payment.use-case';
import { UpdateTenantUseCase } from '../../application/use-cases/update-tenant.use-case';

@ApiTags('tenants')
@ApiBearerAuth()
@SkipTenant()
@PlatformOnly()
@Controller('tenants')
export class TenantsController {
    constructor(
        private readonly createTenantUseCase: CreateTenantUseCase,
        private readonly provisionTenantUseCase: ProvisionTenantUseCase,
        private readonly listTenantsWithStatsUseCase: ListTenantsWithStatsUseCase,
        private readonly getTenantDetailUseCase: GetTenantDetailUseCase,
        private readonly updateTenantUseCase: UpdateTenantUseCase,
        private readonly deleteTenantUseCase: DeleteTenantUseCase,
        private readonly listTenantPaymentsUseCase: ListTenantPaymentsUseCase,
        private readonly createTenantPaymentUseCase: CreateTenantPaymentUseCase,
        private readonly updateTenantPaymentUseCase: UpdateTenantPaymentUseCase,
        private readonly deleteTenantPaymentUseCase: DeleteTenantPaymentUseCase,
    ) {}

    @Post('provision')
    async provision(@Body() dto: ProvisionTenantDto) {
        try {
            return await this.provisionTenantUseCase.execute(dto);
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    @Post()
    async create(@Body() dto: CreateTenantDto) {
        try {
            return await this.createTenantUseCase.execute(dto);
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    @Get()
    findAll() {
        return this.listTenantsWithStatsUseCase.execute();
    }

    @Get(':id')
    async findById(@Param('id', ParseUUIDPipe) id: string) {
        try {
            return await this.getTenantDetailUseCase.execute(id);
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
        try {
            return await this.updateTenantUseCase.execute(id, dto);
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        try {
            await this.deleteTenantUseCase.execute(id);
            return { success: true };
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    @Get(':id/payments')
    async listPayments(@Param('id') id: string) {
        try {
            return await this.listTenantPaymentsUseCase.execute(id);
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    @Post(':id/payments')
    async createPayment(
        @Param('id') id: string,
        @Body() dto: CreateTenantPaymentDto,
    ) {
        try {
            return await this.createTenantPaymentUseCase.execute(id, dto);
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    @Patch(':id/payments/:paymentId')
    async updatePayment(
        @Param('id') id: string,
        @Param('paymentId') paymentId: string,
        @Body() dto: UpdateTenantPaymentDto,
    ) {
        try {
            return await this.updateTenantPaymentUseCase.execute(
                id,
                paymentId,
                dto,
            );
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    @Delete(':id/payments/:paymentId')
    async removePayment(
        @Param('id') id: string,
        @Param('paymentId') paymentId: string,
    ) {
        try {
            await this.deleteTenantPaymentUseCase.execute(id, paymentId);
            return { success: true };
        } catch (error) {
            this.handleApplicationError(error);
        }
    }

    private handleApplicationError(error: unknown): never {
        if (error instanceof TenantNotFoundError) {
            throw new NotFoundException(error.message);
        }

        if (error instanceof TenantCnpjAlreadyInUseError) {
            throw new ConflictException(error.message);
        }

        if (error instanceof ConflictException) {
            throw error;
        }

        if (error instanceof NotFoundException) {
            throw error;
        }

        if (error instanceof Error && error.message.includes('E-mail')) {
            throw new ConflictException(error.message);
        }

        if (
            error instanceof Error &&
            (error.message.includes('CNPJ') ||
                error.message.includes('contrato') ||
                error.message.includes('Mensalidade') ||
                error.message.includes('cobrança') ||
                error.message.includes('vereadores'))
        ) {
            throw new BadRequestException(error.message);
        }

        throw error;
    }
}
