import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantUserRole } from '@prisma/client';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { TenantRoles } from '../common/decorators/tenant-roles.decorator';
import { TenantRolesGuard } from '../common/guards/tenant-roles.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { MesaDiretoraService } from './mesa-diretora.service';
import { AddMembroMesaDto, CreateMesaDiretoraDto } from './dto/mesa-diretora.dto';

@ApiTags('mesa-diretora')
@ApiBearerAuth()
@Controller('mesa-diretora')
export class MesaDiretoraController {
  constructor(private readonly service: MesaDiretoraService) {}

  @Get()
  findAll(@TenantId() tenantId: string, @Query() query: ListQueryDto) {
    return this.service.findAll(tenantId, query);
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
  create(@TenantId() tenantId: string, @Body() dto: CreateMesaDiretoraDto) {
    return this.service.create(tenantId, dto);
  }

  @UseGuards(TenantRolesGuard)
  @TenantRoles(
    TenantUserRole.ADMIN,
    TenantUserRole.OWNER,
    TenantUserRole.MANAGER,
  )
  @Post(':id/membros')
  addMembro(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMembroMesaDto,
  ) {
    return this.service.addMembro(tenantId, id, dto);
  }
}
