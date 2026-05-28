import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReadRoles, WriteRoles } from '../common/decorators/api-roles.decorator';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { AddMembroMesaDto, CreateMesaDiretoraDto } from './dto/mesa-diretora.dto';
import { MesaDiretoraService } from './mesa-diretora.service';

@ApiTags('mesa-diretora')
@ApiBearerAuth()
@Controller('mesa-diretora')
export class MesaDiretoraController {
  constructor(private readonly service: MesaDiretoraService) {}

  @ReadRoles()
  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.service.findAll(query);
  }

  @ReadRoles()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @WriteRoles()
  @Post()
  create(@Body() dto: CreateMesaDiretoraDto) {
    return this.service.create(dto);
  }

  @WriteRoles()
  @Post(':id/membros')
  addMembro(@Param('id') id: string, @Body() dto: AddMembroMesaDto) {
    return this.service.addMembro(id, dto);
  }
}
