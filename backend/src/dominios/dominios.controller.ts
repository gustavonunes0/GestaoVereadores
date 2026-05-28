import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReadRoles } from '../common/decorators/api-roles.decorator';
import { DominiosService } from './dominios.service';

@ApiTags('dominios')
@ApiBearerAuth()
@Controller('dominios')
export class DominiosController {
  constructor(private readonly service: DominiosService) {}

  @ReadRoles()
  @Get()
  findAll() {
    return this.service.findAll();
  }
}
