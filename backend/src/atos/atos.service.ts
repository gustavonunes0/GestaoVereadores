import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { assertFound } from '../common/prisma/assert-found';
import { buildDateRangeFilter, toOptionalDate } from '../common/prisma/date-fields';
import { paginatedQuery } from '../common/prisma/paginate';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAtoDto, FilterAtoDto } from './dto/ato.dto';
import { UpdateAtoDto } from './dto/update-ato.dto';

@Injectable()
export class AtosService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAtoDto) {
    return this.prisma.ato.create({
      data: {
        ...dto,
        dataInicio: toOptionalDate(dto.dataInicio),
        dataFim: toOptionalDate(dto.dataFim),
      },
      include: { tipo: true, classificacao: true },
    });
  }

  findAll(filters: FilterAtoDto) {
    const where: Prisma.AtoWhereInput = {};
    if (filters.tipoId) where.tipoId = filters.tipoId;
    if (filters.classificacaoId) where.classificacaoId = filters.classificacaoId;
    if (filters.numero) where.numero = { contains: filters.numero };
    const pubRange = buildDateRangeFilter(
      filters.dataPublicacaoDe,
      filters.dataPublicacaoAte,
    );
    if (pubRange) where.dataPublicacaoInicio = pubRange;

    return paginatedQuery(
      () => this.prisma.ato.count({ where }),
      (skip, take) =>
        this.prisma.ato.findMany({
          where,
          include: { tipo: true, classificacao: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
      filters,
    );
  }

  async findOne(id: string) {
    const item = await this.prisma.ato.findUnique({
      where: { id },
      include: { tipo: true, classificacao: true },
    });
    return assertFound(item, 'Ato não encontrado');
  }

  async update(id: string, dto: UpdateAtoDto) {
    await this.findOne(id);
    return this.prisma.ato.update({
      where: { id },
      data: {
        tipoId: dto.tipoId,
        classificacaoId: dto.classificacaoId,
        numero: dto.numero,
        dataInicio: toOptionalDate(dto.dataInicio),
        dataFim: toOptionalDate(dto.dataFim),
      },
      include: { tipo: true, classificacao: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.ato.delete({ where: { id } });
  }
}
