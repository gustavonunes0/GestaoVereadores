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
import {
  CreateLegislaturaDto,
  CreateSessaoLegislativaDto,
} from './dto/legislatura.dto';
import { UpdateLegislaturaDto } from './dto/update-legislatura.dto';
import { LegislaturasService } from './legislaturas.service';

@ApiTags('legislaturas')
@ApiBearerAuth()
@Controller('legislaturas')
export class LegislaturasController {
  constructor(private readonly service: LegislaturasService) {}

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
  create(@Body() dto: CreateLegislaturaDto) {
    return this.service.create(dto);
  }

  @WriteRoles()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLegislaturaDto) {
    return this.service.update(id, dto);
  }

  @WriteRoles()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @WriteRoles()
  @Post(':id/sessoes-legislativas')
  createSessaoLegislativa(
    @Param('id') id: string,
    @Body() dto: CreateSessaoLegislativaDto,
  ) {
    return this.service.createSessaoLegislativa(id, dto);
  }
}
