import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReadRoles, WriteRoles } from '../common/decorators/api-roles.decorator';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { ComissoesService } from './comissoes.service';
import { AddMembroComissaoDto, CreateComissaoDto } from './dto/create-comissao.dto';
import { UpdateComissaoDto } from './dto/update-comissao.dto';

@ApiTags('comissoes')
@ApiBearerAuth()
@Controller('comissoes')
export class ComissoesController {
  constructor(private readonly service: ComissoesService) {}

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
  create(@Body() dto: CreateComissaoDto) {
    return this.service.create(dto);
  }

  @WriteRoles()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateComissaoDto) {
    return this.service.update(id, dto);
  }

  @WriteRoles()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @WriteRoles()
  @Post(':id/membros')
  addMembro(@Param('id') id: string, @Body() dto: AddMembroComissaoDto) {
    return this.service.addMembro(id, dto);
  }

  @WriteRoles()
  @Delete(':id/membros/:membroId')
  removeMembro(@Param('id') id: string, @Param('membroId') membroId: string) {
    return this.service.removeMembro(id, membroId);
  }
}
