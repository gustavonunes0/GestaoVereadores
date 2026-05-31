import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { DominiosService } from './dominios.service';

@ApiTags('dominios')
@ApiBearerAuth()
@Controller('dominios')
export class DominiosController {
  constructor(private readonly service: DominiosService) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.service.findAll(tenantId);
  }
}
