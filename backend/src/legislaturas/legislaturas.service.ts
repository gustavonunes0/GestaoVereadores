import { Injectable } from '@nestjs/common';
import { assertFound } from '../common/prisma/assert-found';
import { toOptionalDate } from '../common/prisma/date-fields';
import { paginatedQuery } from '../common/prisma/paginate';
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

  create(dto: CreateLegislaturaDto) {
    return this.prisma.legislatura.create({
      data: {
        numero: dto.numero,
        dataInicio: new Date(dto.dataInicio),
        dataFim: toOptionalDate(dto.dataFim),
      },
    });
  }

  findAll(query: ListQueryDto) {
    return paginatedQuery(
      () => this.prisma.legislatura.count(),
      (skip, take) =>
        this.prisma.legislatura.findMany({
          include: { sessoesLegislativas: true },
          orderBy: { numero: 'desc' },
          skip,
          take,
        }),
      query,
    );
  }

  async findOne(id: string) {
    const item = await this.prisma.legislatura.findUnique({
      where: { id },
      include: {
        sessoesLegislativas: { include: { sessoesPlenarias: true } },
        mesasDiretoras: { include: { membros: true } },
      },
    });
    return assertFound(item, 'Legislatura não encontrada');
  }

  async update(id: string, dto: UpdateLegislaturaDto) {
    await this.findOne(id);
    return this.prisma.legislatura.update({
      where: { id },
      data: {
        numero: dto.numero,
        dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
        dataFim: toOptionalDate(dto.dataFim),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.legislatura.delete({ where: { id } });
  }

  async createSessaoLegislativa(
    legislaturaId: string,
    dto: CreateSessaoLegislativaDto,
  ) {
    await this.findOne(legislaturaId);
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
