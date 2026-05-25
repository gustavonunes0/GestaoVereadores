import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
  AddMembroFrenteDto,
  CreateFrenteDto,
  FrentesService,
} from './frentes.service';

@Controller('frentes')
export class FrentesController {
  constructor(private readonly service: FrentesService) {}

  @Post()
  create(@Body() dto: CreateFrenteDto) {
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateFrenteDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/membros')
  addMembro(@Param('id') id: string, @Body() dto: AddMembroFrenteDto) {
    return this.service.addMembro(id, dto);
  }
}
