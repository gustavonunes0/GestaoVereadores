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
import { FrentesService } from './frentes.service';
import { AddMembroFrenteDto, CreateFrenteDto } from './dto/create-frente.dto';
import { UpdateFrenteDto } from './dto/update-frente.dto';

@ApiTags('frentes')
@ApiBearerAuth()
@Controller('frentes')
export class FrentesController {
  constructor(private readonly service: FrentesService) {}

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
  create(@TenantId() tenantId: string, @Body() dto: CreateFrenteDto) {
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
    @Body() dto: UpdateFrenteDto,
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
    @Body() dto: AddMembroFrenteDto,
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
