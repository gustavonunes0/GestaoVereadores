import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReadRoles } from '../common/decorators/api-roles.decorator';
import {
  RelatorioAtividadeCompletoDto,
  RelatorioAtividadeGeralDto,
  RelatorioPresencaDto,
} from './dto/relatorio.dto';
import { RelatoriosService } from './relatorios.service';

@ApiTags('relatorios')
@ApiBearerAuth()
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly service: RelatoriosService) {}

  @ReadRoles()
  @Post('atividade-legislativa/completo')
  atividadeCompleto(@Body() dto: RelatorioAtividadeCompletoDto) {
    return this.service.atividadeCompleto(dto);
  }

  @ReadRoles()
  @Post('atividade-legislativa/geral')
  atividadeGeral(@Body() dto: RelatorioAtividadeGeralDto) {
    return this.service.atividadeGeral(dto);
  }

  @ReadRoles()
  @Post('presenca')
  presenca(@Body() dto: RelatorioPresencaDto) {
    return this.service.presenca(dto);
  }
}
