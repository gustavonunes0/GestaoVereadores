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
import { CreateNormaDto, FilterNormaDto } from './dto/norma.dto';
import { UpdateNormaDto } from './dto/update-norma.dto';
import { NormasService } from './normas.service';

@ApiTags('normas')
@ApiBearerAuth()
@Controller('normas')
export class NormasController {
  constructor(private readonly service: NormasService) {}

  @ReadRoles()
  @Get()
  findAll(@Query() filters: FilterNormaDto) {
    return this.service.findAll(filters);
  }

  @ReadRoles()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @WriteRoles()
  @Post()
  create(@Body() dto: CreateNormaDto) {
    return this.service.create(dto);
  }

  @WriteRoles()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNormaDto) {
    return this.service.update(id, dto);
  }

  @WriteRoles()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
