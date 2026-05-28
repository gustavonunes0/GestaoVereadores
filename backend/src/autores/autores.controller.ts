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
import { AutoresService } from './autores.service';
import { CreateAutorDto, FilterAutorDto, UpdateAutorDto } from './dto/autor.dto';

@ApiTags('autores')
@ApiBearerAuth()
@Controller('autores')
export class AutoresController {
  constructor(private readonly service: AutoresService) {}

  @ReadRoles()
  @Get()
  findAll(@Query() filters: FilterAutorDto) {
    return this.service.findAll(filters);
  }

  @ReadRoles()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @WriteRoles()
  @Post()
  create(@Body() dto: CreateAutorDto) {
    return this.service.create(dto);
  }

  @WriteRoles()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAutorDto) {
    return this.service.update(id, dto);
  }

  @WriteRoles()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
