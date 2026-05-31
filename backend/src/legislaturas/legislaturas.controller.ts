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
  create(@TenantId() tenantId: string, @Body() dto: CreateLegislaturaDto) {
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
    @Body() dto: UpdateLegislaturaDto,
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
  @Post(':id/sessoes-legislativas')
  createSessaoLegislativa(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSessaoLegislativaDto,
  ) {
    return this.service.createSessaoLegislativa(tenantId, id, dto);
  }
}
