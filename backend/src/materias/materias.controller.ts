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
import { CreateMateriaDto, FilterMateriaDto } from './dto/materia.dto';
import { MateriasService } from './materias.service';

@Controller('materias')
export class MateriasController {
  constructor(private readonly service: MateriasService) {}

  @Post()
  create(@Body() dto: CreateMateriaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() filters: FilterMateriaDto) {
    return this.service.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateMateriaDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
