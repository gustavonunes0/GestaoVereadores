import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantId } from '../common/decorators/tenant-id.decorator';
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

    @Post('atividade-legislativa/completo')
    atividadeCompleto(
        @TenantId() tenantId: string,
        @Body() dto: RelatorioAtividadeCompletoDto,
    ) {
        return this.service.atividadeCompleto(tenantId, dto);
    }

    @Post('atividade-legislativa/geral')
    atividadeGeral(
        @TenantId() tenantId: string,
        @Body() dto: RelatorioAtividadeGeralDto,
    ) {
        return this.service.atividadeGeral(tenantId, dto);
    }

    @Post('presenca')
    presenca(@TenantId() tenantId: string, @Body() dto: RelatorioPresencaDto) {
        return this.service.presenca(tenantId, dto);
    }
}
