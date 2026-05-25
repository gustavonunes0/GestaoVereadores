import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  AddMembroMesaDto,
  CreateMesaDiretoraDto,
  MesaDiretoraService,
} from './mesa-diretora.service';

@Controller('mesa-diretora')
export class MesaDiretoraController {
  constructor(private readonly service: MesaDiretoraService) {}

  @Post()
  create(@Body() dto: CreateMesaDiretoraDto) {
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

  @Post(':id/membros')
  addMembro(@Param('id') id: string, @Body() dto: AddMembroMesaDto) {
    return this.service.addMembro(id, dto);
  }
}
