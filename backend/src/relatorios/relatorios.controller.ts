import { Body, Controller, Post } from '@nestjs/common';
import {
  RelatorioAtividadeCompletoDto,
  RelatorioAtividadeGeralDto,
  RelatorioPresencaDto,
  RelatoriosService,
} from './relatorios.service';

@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly service: RelatoriosService) {}

  @Post('atividade-legislativa/completo')
  atividadeCompleto(@Body() dto: RelatorioAtividadeCompletoDto) {
    return this.service.atividadeCompleto(dto);
  }

  @Post('atividade-legislativa/geral')
  atividadeGeral(@Body() dto: RelatorioAtividadeGeralDto) {
    return this.service.atividadeGeral(dto);
  }

  @Post('presenca')
  presenca(@Body() dto: RelatorioPresencaDto) {
    return this.service.presenca(dto);
  }
}
