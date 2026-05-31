import { Injectable, NotFoundException } from '@nestjs/common';
import { toOptionalDate } from '../common/prisma/date-fields';
import { paginatedQuery } from '../common/prisma/paginate';
import { tenantWhere } from '../common/prisma/tenant-scope';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateLegislaturaDto,
  CreateSessaoLegislativaDto,
} from './dto/legislatura.dto';
import { UpdateLegislaturaDto } from './dto/update-legislatura.dto';

@Injectable()
export class LegislaturasService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, dto: CreateLegislaturaDto) {
    return this.prisma.legislatura.create({
      data: {
        tenantId,
        numero: dto.numero,
        dataInicio: new Date(dto.dataInicio),
        dataFim: toOptionalDate(dto.dataFim),
      },
    });
  }

  findAll(tenantId: string, query: ListQueryDto) {
    const where = tenantWhere(tenantId);
    return paginatedQuery(
      () => this.prisma.legislatura.count({ where }),
      (skip, take) =>
        this.prisma.legislatura.findMany({
          where,
          include: { sessoesLegislativas: true },
          orderBy: { numero: 'desc' },
          skip,
          take,
        }),
      query,
    );
  }

  async findOne(tenantId: string, id: string) {
    const item = await this.prisma.legislatura.findFirst({
      where: { id, ...tenantWhere(tenantId) },
      include: {
        sessoesLegislativas: { include: { sessoesPlenarias: true } },
        mesasDiretoras: { include: { membros: true } },
      },
    });
    if (!item) throw new NotFoundException('Legislatura não encontrada');
    return item;
  }

  async update(tenantId: string, id: string, dto: UpdateLegislaturaDto) {
    await this.findOne(tenantId, id);
    return this.prisma.legislatura.update({
      where: { id },
      data: {
        numero: dto.numero,
        dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
        dataFim: toOptionalDate(dto.dataFim),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.legislatura.update({
      where: { id },
      data: { isRemoved: true },
    });
  }

  async createSessaoLegislativa(
    tenantId: string,
    legislaturaId: string,
    dto: CreateSessaoLegislativaDto,
  ) {
    await this.findOne(tenantId, legislaturaId);
    return this.prisma.sessaoLegislativa.create({
      data: {
        legislaturaId,
        numero: dto.numero,
        dataInicio: toOptionalDate(dto.dataInicio),
        dataFim: toOptionalDate(dto.dataFim),
      },
    });
  }
}
