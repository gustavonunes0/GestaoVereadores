import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AtosService, CreateAtoDto, FilterAtoDto } from './atos.service';

@Controller('atos')
export class AtosController {
  constructor(private readonly service: AtosService) {}

  @Post()
  create(@Body() dto: CreateAtoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() filters: FilterAtoDto) {
    return this.service.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
