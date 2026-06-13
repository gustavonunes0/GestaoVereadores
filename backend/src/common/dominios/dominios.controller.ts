import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReadRoles } from '../decorators/api-roles.decorator';
import { TenantId } from '../decorators/tenant-id.decorator';
import { DominiosService } from './dominios.service';

@ApiTags('dominios')
@ApiBearerAuth()
@Controller('dominios')
export class DominiosController {
    constructor(private readonly dominiosService: DominiosService) {}

    @ReadRoles()
    @Get()
    list(@TenantId() tenantId: string) {
        return this.dominiosService.listForTenant(tenantId);
    }
}
