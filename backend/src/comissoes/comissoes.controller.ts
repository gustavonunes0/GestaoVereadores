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
import { ListQueryDto } from '../common/dto/list-query.dto';
import { ComissoesService } from './comissoes.service';
import { AddMembroComissaoDto, CreateComissaoDto } from './dto/create-comissao.dto';
import { UpdateComissaoDto } from './dto/update-comissao.dto';

@ApiTags('comissoes')
@ApiBearerAuth()
@Controller('comissoes')
export class ComissoesController {
  constructor(private readonly service: ComissoesService) {}

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
  create(@TenantId() tenantId: string, @Body() dto: CreateComissaoDto) {
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
    @Body() dto: UpdateComissaoDto,
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
  @Post(':id/membros')
  addMembro(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMembroComissaoDto,
  ) {
    return this.service.addMembro(tenantId, id, dto);
  }

  @UseGuards(TenantRolesGuard)
  @TenantRoles(TenantUserRole.ADMIN, TenantUserRole.OWNER)
  @Delete(':id/membros/:membroId')
  removeMembro(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('membroId', ParseUUIDPipe) membroId: string,
  ) {
    return this.service.removeMembro(tenantId, id, membroId);
  }
}
