import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  AddPautaItemDto,
  CreateSessaoPlenariaDto,
  FilterSessaoPlenariaDto,
  RegistrarPresencaDto,
} from './dto/sessao.dto';
import { SessoesService } from './sessoes.service';

@Controller('sessoes')
export class SessoesController {
  constructor(private readonly service: SessoesService) {}

  @Post()
  create(@Body() dto: CreateSessaoPlenariaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() filters: FilterSessaoPlenariaDto) {
    return this.service.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/pauta')
  addPauta(@Param('id') id: string, @Body() dto: AddPautaItemDto) {
    return this.service.addPautaItem(id, dto);
  }

  @Post(':id/presencas')
  registrarPresenca(
    @Param('id') id: string,
    @Body() dto: RegistrarPresencaDto,
  ) {
    return this.service.registrarPresenca(id, dto);
  }
}
