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
import { ParlamentaresService } from './parlamentares.service';
import { CreateParlamentarDto } from './dto/create-parlamentar.dto';
import { UpdateParlamentarDto } from './dto/update-parlamentar.dto';

@Controller('parlamentares')
export class ParlamentaresController {
  constructor(private readonly service: ParlamentaresService) {}

  @Post()
  create(@Body() dto: CreateParlamentarDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('ativo') ativo?: string) {
    const filtro =
      ativo === undefined ? undefined : ativo === 'true' || ativo === '1';
    return this.service.findAll(filtro);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateParlamentarDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
