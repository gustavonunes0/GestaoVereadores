import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ComissoesService } from './comissoes.service';
import { AddMembroComissaoDto, CreateComissaoDto } from './dto/create-comissao.dto';
import { UpdateComissaoDto } from './dto/update-comissao.dto';

@Controller('comissoes')
export class ComissoesController {
  constructor(private readonly service: ComissoesService) {}

  @Post()
  create(@Body() dto: CreateComissaoDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateComissaoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/membros')
  addMembro(@Param('id') id: string, @Body() dto: AddMembroComissaoDto) {
    return this.service.addMembro(id, dto);
  }

  @Delete(':id/membros/:membroId')
  removeMembro(@Param('id') id: string, @Param('membroId') membroId: string) {
    return this.service.removeMembro(id, membroId);
  }
}
