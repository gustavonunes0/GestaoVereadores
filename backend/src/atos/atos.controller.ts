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
import { SkipTenant } from '../common/decorators/skip-tenant.decorator';
import { CreateAtoDto, FilterAtoDto } from './dto/ato.dto';
import { UpdateAtoDto } from './dto/update-ato.dto';
import { AtosService } from './atos.service';

@ApiTags('atos')
@ApiBearerAuth()
@SkipTenant()
@Controller('atos')
export class AtosController {
  constructor(private readonly service: AtosService) {}

  @ReadRoles()
  @Get()
  findAll(@Query() filters: FilterAtoDto) {
    return this.service.findAll(filters);
  }

  @ReadRoles()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @WriteRoles()
  @Post()
  create(@Body() dto: CreateAtoDto) {
    return this.service.create(dto);
  }

  @WriteRoles()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAtoDto) {
    return this.service.update(id, dto);
  }

  @WriteRoles()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
