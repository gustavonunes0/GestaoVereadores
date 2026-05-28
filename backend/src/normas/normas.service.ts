import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { assertFound } from '../common/prisma/assert-found';
import { toOptionalDate } from '../common/prisma/date-fields';
import { paginatedQuery } from '../common/prisma/paginate';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNormaDto, FilterNormaDto } from './dto/norma.dto';
import { UpdateNormaDto } from './dto/update-norma.dto';

@Injectable()
export class NormasService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateNormaDto) {
    return this.prisma.norma.create({
      data: {
        ...dto,
        data: toOptionalDate(dto.data),
      },
      include: { tipo: true, ano: true, materiaOrigem: true },
    });
  }

  findAll(filters: FilterNormaDto) {
    const where: Prisma.NormaWhereInput = {};
    if (filters.tipoId) where.tipoId = filters.tipoId;
    if (filters.anoId) where.anoId = filters.anoId;
    if (filters.numero) where.numero = { contains: filters.numero };

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

  async findOne(id: string) {
    const item = await this.prisma.norma.findUnique({
      where: { id },
      include: { tipo: true, ano: true, materiaOrigem: true, esferaFederacao: true },
    });
    return assertFound(item, 'Norma não encontrada');
  }

  async update(id: string, dto: UpdateNormaDto) {
    await this.findOne(id);
    const { data, ...rest } = dto;
    return this.prisma.norma.update({
      where: { id },
      data: { ...rest, data: toOptionalDate(data) },
      include: { tipo: true, ano: true, materiaOrigem: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.norma.delete({ where: { id } });
  }
}
