import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildDateRangeFilter, toOptionalDate } from '../common/prisma/date-fields';
import { paginatedQuery } from '../common/prisma/paginate';
import { tenantWhere } from '../common/prisma/tenant-scope';
import { PrismaService } from '../prisma/prisma.service';
import { assertMateriaPodeGerarNorma } from '../materias/domain/materia-workflow';
import { CreateNormaDto, FilterNormaDto } from './dto/norma.dto';
import { UpdateNormaDto } from './dto/update-norma.dto';

@Injectable()
export class NormasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateNormaDto) {
    if (dto.materiaOrigemId) {
      const materia = await this.prisma.materia.findFirst({
        where: { id: dto.materiaOrigemId, ...tenantWhere(tenantId) },
      });
      if (!materia) {
        throw new NotFoundException('Matéria de origem não encontrada');
      }
      assertMateriaPodeGerarNorma(materia);
    }

    return this.prisma.norma.create({
      data: {
        ...dto,
        tenantId,
        data: toOptionalDate(dto.data),
      },
      include: { tipo: true, ano: true, materiaOrigem: true },
    });
  }

  findAll(tenantId: string, filters: FilterNormaDto) {
    const where: Prisma.NormaWhereInput = { ...tenantWhere(tenantId) };
    if (filters.tipoId) where.tipoId = filters.tipoId;
    if (filters.anoId) where.anoId = filters.anoId;
    if (filters.numero) where.numero = { contains: filters.numero };
    const pubRange = buildDateRangeFilter(
      filters.dataPublicacaoDe,
      filters.dataPublicacaoAte,
    );
    if (pubRange) {
      where.OR = [
        { dataPublicacaoInicio: pubRange },
        { data: pubRange },
      ];
    }

    return paginatedQuery(
      () => this.prisma.norma.count({ where }),
      (skip, take) =>
        this.prisma.norma.findMany({
          where,
          include: { tipo: true, ano: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
      filters,
    );
  }

  async findOne(tenantId: string, id: string) {
    const item = await this.prisma.norma.findFirst({
      where: { id, ...tenantWhere(tenantId) },
      include: { tipo: true, ano: true, materiaOrigem: true, esferaFederacao: true },
    });
    if (!item) throw new NotFoundException('Norma não encontrada');
    return item;
  }

  async update(tenantId: string, id: string, dto: UpdateNormaDto) {
    await this.findOne(tenantId, id);

    if (dto.materiaOrigemId) {
      const materia = await this.prisma.materia.findFirst({
        where: { id: dto.materiaOrigemId, ...tenantWhere(tenantId) },
      });
      if (!materia) {
        throw new NotFoundException('Matéria de origem não encontrada');
      }
      assertMateriaPodeGerarNorma(materia);
    }

    const { data, ...rest } = dto;
    return this.prisma.norma.update({
      where: { id },
      data: { ...rest, data: toOptionalDate(data) },
      include: { tipo: true, ano: true, materiaOrigem: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.norma.update({
      where: { id },
      data: { isRemoved: true },
    });
  }
}
