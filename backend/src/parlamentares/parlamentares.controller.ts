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
import { CreateParlamentarDto } from './dto/create-parlamentar.dto';
import { FilterParlamentarDto } from './dto/filter-parlamentar.dto';
import { UpdateParlamentarDto } from './dto/update-parlamentar.dto';
import { ParlamentaresService } from './parlamentares.service';

@ApiTags('parlamentares')
@ApiBearerAuth()
@Controller('parlamentares')
export class ParlamentaresController {
  constructor(private readonly service: ParlamentaresService) {}

  @ReadRoles()
  @Get()
  findAll(@Query() query: FilterParlamentarDto) {
    return this.service.findAll(query);
  }

  @ReadRoles()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @WriteRoles()
  @Post()
  create(@Body() dto: CreateParlamentarDto) {
    return this.service.create(dto);
  }

  @WriteRoles()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateParlamentarDto) {
    return this.service.update(id, dto);
  }

  @WriteRoles()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
