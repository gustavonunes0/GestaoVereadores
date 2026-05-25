import { Controller, Get } from '@nestjs/common';
import { DominiosService } from './dominios.service';

@Controller('dominios')
export class DominiosController {
  constructor(private readonly service: DominiosService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
