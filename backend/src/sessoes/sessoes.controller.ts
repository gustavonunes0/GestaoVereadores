import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantUserRole } from '@prisma/client';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { TenantRoles } from '../common/decorators/tenant-roles.decorator';
import { TenantRolesGuard } from '../common/guards/tenant-roles.guard';
import {
  AddPautaItemDto,
  CreateSessaoPlenariaDto,
  FilterSessaoPlenariaDto,
  RegistrarPresencaDto,
  RegistrarResultadoPautaDto,
} from './dto/sessao.dto';
import {
  AbrirVotacaoDto,
  FinalizarVotacaoDto,
  RegistrarVotoDto,
} from './dto/votacao.dto';
import { UpdateSessaoPlenariaDto } from './dto/update-sessao.dto';
import { SessoesService } from './sessoes.service';

@ApiTags('sessoes')
@ApiBearerAuth()
@Controller('sessoes')
export class SessoesController {
  constructor(private readonly service: SessoesService) {}

  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Query() filters: FilterSessaoPlenariaDto,
  ) {
    return this.service.findAll(tenantId, filters);
  }

  @Get(':id')
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @UseGuards(TenantRolesGuard)
  @TenantRoles(
    TenantUserRole.ADMIN,
    TenantUserRole.OWNER,
    TenantUserRole.MANAGER,
  )
  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateSessaoPlenariaDto) {
    return this.service.create(tenantId, dto);
  }

  @UseGuards(TenantRolesGuard)
  @TenantRoles(
    TenantUserRole.ADMIN,
    TenantUserRole.OWNER,
    TenantUserRole.MANAGER,
  )
  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSessaoPlenariaDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @UseGuards(TenantRolesGuard)
  @TenantRoles(TenantUserRole.ADMIN, TenantUserRole.OWNER)
  @Delete(':id')
  remove(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(tenantId, id);
  }

  @UseGuards(TenantRolesGuard)
  @TenantRoles(
    TenantUserRole.ADMIN,
    TenantUserRole.OWNER,
    TenantUserRole.MANAGER,
  )
  @Post(':id/pauta')
  addPauta(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddPautaItemDto,
  ) {
    return this.service.addPautaItem(tenantId, id, dto);
  }

  @UseGuards(TenantRolesGuard)
  @TenantRoles(
    TenantUserRole.ADMIN,
    TenantUserRole.OWNER,
    TenantUserRole.MANAGER,
  )
  @Delete(':id/pauta/:pautaItemId')
  removerPauta(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('pautaItemId', ParseUUIDPipe) pautaItemId: string,
  ) {
    return this.service.removerPautaItem(tenantId, id, pautaItemId);
  }

  @UseGuards(TenantRolesGuard)
  @TenantRoles(
    TenantUserRole.ADMIN,
    TenantUserRole.OWNER,
    TenantUserRole.MANAGER,
  )
  @Patch(':id/pauta/:pautaItemId/resultado')
  registrarResultadoPauta(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('pautaItemId', ParseUUIDPipe) pautaItemId: string,
    @Body() dto: RegistrarResultadoPautaDto,
  ) {
    return this.service.registrarResultadoPauta(
      tenantId,
      id,
      pautaItemId,
      dto,
    );
  }

  @UseGuards(TenantRolesGuard)
  @TenantRoles(
    TenantUserRole.ADMIN,
    TenantUserRole.OWNER,
    TenantUserRole.MANAGER,
  )
  @Post(':id/presencas')
  registrarPresenca(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RegistrarPresencaDto,
  ) {
    return this.service.registrarPresenca(tenantId, id, dto);
  }

  @Get(':id/pauta/:pautaItemId/votacao')
  obterVotacao(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('pautaItemId', ParseUUIDPipe) pautaItemId: string,
  ) {
    return this.service.obterVotacao(tenantId, id, pautaItemId);
  }

  @UseGuards(TenantRolesGuard)
  @TenantRoles(
    TenantUserRole.ADMIN,
    TenantUserRole.OWNER,
    TenantUserRole.MANAGER,
  )
  @Post(':id/pauta/:pautaItemId/votacao')
  abrirVotacao(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('pautaItemId', ParseUUIDPipe) pautaItemId: string,
    @Body() dto: AbrirVotacaoDto,
  ) {
    return this.service.abrirVotacao(tenantId, id, pautaItemId, dto);
  }

  @UseGuards(TenantRolesGuard)
  @TenantRoles(
    TenantUserRole.ADMIN,
    TenantUserRole.OWNER,
    TenantUserRole.MANAGER,
  )
  @Post(':id/pauta/:pautaItemId/votacao/votos')
  registrarVoto(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('pautaItemId', ParseUUIDPipe) pautaItemId: string,
    @Body() dto: RegistrarVotoDto,
  ) {
    return this.service.registrarVoto(tenantId, id, pautaItemId, dto);
  }

  @UseGuards(TenantRolesGuard)
  @TenantRoles(
    TenantUserRole.ADMIN,
    TenantUserRole.OWNER,
    TenantUserRole.MANAGER,
  )
  @Patch(':id/pauta/:pautaItemId/votacao/finalizar')
  finalizarVotacao(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('pautaItemId', ParseUUIDPipe) pautaItemId: string,
    @Body() dto: FinalizarVotacaoDto,
  ) {
    return this.service.finalizarVotacao(tenantId, id, pautaItemId, dto);
  }
}
