import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { toOptionalDate } from '../common/prisma/date-fields';
import { paginatedQuery } from '../common/prisma/paginate';
import { tenantWhere } from '../common/prisma/tenant-scope';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgendaDto, FilterAgendaDto, UpdateAgendaDto } from './dto/agenda.dto';

@Injectable()
export class AgendaService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, dto: CreateAgendaDto) {
    return this.prisma.agendaLegislativa.create({
      data: {
        tenantId,
        numero: dto.numero,
        titulo: dto.titulo,
        mensagem: dto.mensagem,
        dataInicio: toOptionalDate(dto.dataInicio),
        dataFim: toOptionalDate(dto.dataFim),
      },
    });
  }

  findAll(tenantId: string, filters: FilterAgendaDto) {
    const where: Prisma.AgendaLegislativaWhereInput = {
      ...tenantWhere(tenantId),
    };
    if (filters.dataInicioDe || filters.dataInicioAte) {
      where.dataInicio = {};
      if (filters.dataInicioDe) {
        where.dataInicio.gte = toOptionalDate(filters.dataInicioDe);
      }
      if (filters.dataInicioAte) {
        where.dataInicio.lte = toOptionalDate(filters.dataInicioAte);
      }
    }

    return paginatedQuery(
      () => this.prisma.agendaLegislativa.count({ where }),
      (skip, take) =>
        this.prisma.agendaLegislativa.findMany({
          where,
          orderBy: { dataInicio: 'desc' },
          skip,
          take,
        }),
      filters,
    );
  }

  async findOne(tenantId: string, id: string) {
    const item = await this.prisma.agendaLegislativa.findFirst({
      where: { id, ...tenantWhere(tenantId) },
    });
    if (!item) throw new NotFoundException('Agenda não encontrada');
    return item;
  }

  async update(tenantId: string, id: string, dto: UpdateAgendaDto) {
    await this.findOne(tenantId, id);
    return this.prisma.agendaLegislativa.update({
      where: { id },
      data: {
        numero: dto.numero,
        titulo: dto.titulo,
        mensagem: dto.mensagem,
        dataInicio: toOptionalDate(dto.dataInicio),
        dataFim: toOptionalDate(dto.dataFim),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.agendaLegislativa.update({
      where: { id },
      data: { isRemoved: true },
    });
  }
}
