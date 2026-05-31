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
import { AlterarStatusMateriaDto } from './dto/alterar-status-materia.dto';
import { AdicionarMateriaAutorDto } from './dto/materia-autor.dto';
import { CreateMateriaDto, FilterMateriaDto } from './dto/materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';
import { MateriasService } from './materias.service';

@ApiTags('materias')
@ApiBearerAuth()
@Controller('materias')
export class MateriasController {
  constructor(private readonly service: MateriasService) {}

  @Get()
  findAll(@TenantId() tenantId: string, @Query() filters: FilterMateriaDto) {
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
  create(@TenantId() tenantId: string, @Body() dto: CreateMateriaDto) {
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
    @Body() dto: UpdateMateriaDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @UseGuards(TenantRolesGuard)
  @TenantRoles(
    TenantUserRole.ADMIN,
    TenantUserRole.OWNER,
    TenantUserRole.MANAGER,
  )
  @Get(':id/autores')
  listarAutores(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.listarAutores(tenantId, id);
  }

  @UseGuards(TenantRolesGuard)
  @TenantRoles(
    TenantUserRole.ADMIN,
    TenantUserRole.OWNER,
    TenantUserRole.MANAGER,
  )
  @Post(':id/autores')
  adicionarAutor(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdicionarMateriaAutorDto,
  ) {
    return this.service.adicionarAutor(tenantId, id, dto);
  }

  @UseGuards(TenantRolesGuard)
  @TenantRoles(
    TenantUserRole.ADMIN,
    TenantUserRole.OWNER,
    TenantUserRole.MANAGER,
  )
  @Delete(':id/autores/:materiaAutorId')
  removerAutor(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('materiaAutorId', ParseUUIDPipe) materiaAutorId: string,
  ) {
    return this.service.removerAutor(tenantId, id, materiaAutorId);
  }

  @Patch(':id/status')
  alterarStatus(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AlterarStatusMateriaDto,
  ) {
    return this.service.alterarStatus(tenantId, id, dto);
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
}
