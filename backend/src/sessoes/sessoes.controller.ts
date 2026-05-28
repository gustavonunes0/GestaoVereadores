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
import {
  AddPautaItemDto,
  CreateSessaoPlenariaDto,
  FilterSessaoPlenariaDto,
  RegistrarPresencaDto,
} from './dto/sessao.dto';
import { UpdateSessaoPlenariaDto } from './dto/update-sessao.dto';
import { SessoesService } from './sessoes.service';

@ApiTags('sessoes')
@ApiBearerAuth()
@Controller('sessoes')
export class SessoesController {
  constructor(private readonly service: SessoesService) {}

  @ReadRoles()
  @Get()
  findAll(@Query() filters: FilterSessaoPlenariaDto) {
    return this.service.findAll(filters);
  }

  @ReadRoles()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @WriteRoles()
  @Post()
  create(@Body() dto: CreateSessaoPlenariaDto) {
    return this.service.create(dto);
  }

  @WriteRoles()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSessaoPlenariaDto) {
    return this.service.update(id, dto);
  }

  @WriteRoles()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @WriteRoles()
  @Post(':id/pauta')
  addPauta(@Param('id') id: string, @Body() dto: AddPautaItemDto) {
    return this.service.addPautaItem(id, dto);
  }

  @WriteRoles()
  @Post(':id/presencas')
  registrarPresenca(
    @Param('id') id: string,
    @Body() dto: RegistrarPresencaDto,
  ) {
    return this.service.registrarPresenca(id, dto);
  }
}
