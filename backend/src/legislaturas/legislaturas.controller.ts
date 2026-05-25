import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  CreateLegislaturaDto,
  CreateSessaoLegislativaDto,
  LegislaturasService,
} from './legislaturas.service';

@Controller('legislaturas')
export class LegislaturasController {
  constructor(private readonly service: LegislaturasService) {}

  @Post()
  create(@Body() dto: CreateLegislaturaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/sessoes-legislativas')
  createSessaoLegislativa(
    @Param('id') id: string,
    @Body() dto: CreateSessaoLegislativaDto,
  ) {
    return this.service.createSessaoLegislativa(id, dto);
  }
}
