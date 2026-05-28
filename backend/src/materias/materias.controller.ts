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
import { CreateMateriaDto, FilterMateriaDto } from './dto/materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';
import { MateriasService } from './materias.service';

@ApiTags('materias')
@ApiBearerAuth()
@Controller('materias')
export class MateriasController {
  constructor(private readonly service: MateriasService) {}

  @ReadRoles()
  @Get()
  findAll(@Query() filters: FilterMateriaDto) {
    return this.service.findAll(filters);
  }

  @ReadRoles()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @WriteRoles()
  @Post()
  create(@Body() dto: CreateMateriaDto) {
    return this.service.create(dto);
  }

  @WriteRoles()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMateriaDto) {
    return this.service.update(id, dto);
  }

  @WriteRoles()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
