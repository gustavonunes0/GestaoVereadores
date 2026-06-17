import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantId } from '../../../../common/decorators/tenant-id.decorator';
import { TenantRoles } from '../../../../common/decorators/tenant-roles.decorator';
import { PaginationQueryDto } from '../../../../common/dto/pagination.dto';
import { ADMIN_ONLY } from '../../../../auth/guards/guard-combos';
import { ConvidarUsuarioDto } from '../dto/convidar-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { ConvidarTenantStaffUseCase } from '../use-cases/convidar-tenant-staff.use-case';
import { ListTenantStaffUseCase } from '../use-cases/list-tenant-staff.use-case';
import { UpdateTenantStaffUseCase } from '../use-cases/update-tenant-staff.use-case';

@ApiTags('identidade-usuarios')
@ApiBearerAuth()
@Controller('identidade/usuarios')
export class UsuariosIdentidadeController {
    constructor(
        private readonly listTenantStaff: ListTenantStaffUseCase,
        private readonly convidarTenantStaff: ConvidarTenantStaffUseCase,
        private readonly updateTenantStaff: UpdateTenantStaffUseCase,
    ) {}

    @TenantRoles(...ADMIN_ONLY)
    @Get()
    list(
        @TenantId() tenantId: string,
        @Query() query: PaginationQueryDto,
    ) {
        return this.listTenantStaff.execute(tenantId, query);
    }

    @TenantRoles(...ADMIN_ONLY)
    @Post('convidar')
    convidar(
        @TenantId() tenantId: string,
        @Body() dto: ConvidarUsuarioDto,
    ) {
        return this.convidarTenantStaff.execute(tenantId, dto);
    }

    @TenantRoles(...ADMIN_ONLY)
    @Patch(':id')
    async update(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateUsuarioDto,
    ) {
        try {
            return await this.updateTenantStaff.execute(tenantId, id, dto);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw error;
        }
    }

    @TenantRoles(...ADMIN_ONLY)
    @Patch(':id/desativar')
    desativar(@TenantId() tenantId: string, @Param('id') id: string) {
        return this.updateTenantStaff.execute(tenantId, id, { ativo: false });
    }
}
