import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  CreateNormaDto,
  FilterNormaDto,
  NormasService,
} from './normas.service';

@Controller('normas')
export class NormasController {
  constructor(private readonly service: NormasService) {}

  @Post()
  create(@Body() dto: CreateNormaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() filters: FilterNormaDto) {
    return this.service.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
