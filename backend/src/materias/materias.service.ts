import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { assertFound } from '../common/prisma/assert-found';
import { toOptionalDate } from '../common/prisma/date-fields';
import { paginatedQuery } from '../common/prisma/paginate';
import { materiaRelationsInclude } from '../common/prisma/prisma-includes';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMateriaDto, FilterMateriaDto } from './dto/materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';

@Injectable()
export class MateriasService {
  constructor(private readonly prisma: PrismaService) {}

  private mapPresentationDates(dto: {
    dataApresentacaoInicio?: string;
    dataApresentacaoFim?: string;
  }) {
    return {
      dataApresentacaoInicio: toOptionalDate(dto.dataApresentacaoInicio),
      dataApresentacaoFim: toOptionalDate(dto.dataApresentacaoFim),
    };
  }

  create(dto: CreateMateriaDto) {
    const {
      dataApresentacaoInicio: _di,
      dataApresentacaoFim: _df,
      ...rest
    } = dto;
    const { dataApresentacaoInicio, dataApresentacaoFim } =
      this.mapPresentationDates(dto);
    return this.prisma.materia.create({
      data: {
        ...rest,
        dataApresentacaoInicio,
        dataApresentacaoFim,
        emTramitacao: dto.emTramitacao ?? true,
      },
      include: materiaRelationsInclude,
    });
  }

  findAll(filters: FilterMateriaDto) {
    const where: Prisma.MateriaWhereInput = {};
    if (filters.tipoId) where.tipoId = filters.tipoId;
    if (filters.anoId) where.anoId = filters.anoId;
    if (filters.tematicaId) where.tematicaId = filters.tematicaId;
    if (filters.autorId) where.autorId = filters.autorId;
    if (filters.relatorId) where.relatorId = filters.relatorId;
    if (filters.statusTramitacaoId) {
      where.statusTramitacaoId = filters.statusTramitacaoId;
    }
    if (filters.emTramitacao !== undefined) {
      where.emTramitacao = filters.emTramitacao;
    }
    if (filters.numero) where.numero = filters.numero;
    if (filters.ementa) {
      where.ementa = { contains: filters.ementa };
    }
    return paginatedQuery(
      () => this.prisma.materia.count({ where }),
      (skip, take) =>
        this.prisma.materia.findMany({
          where,
          include: materiaRelationsInclude,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
      filters,
    );
  }

  async findOne(id: string) {
    const item = await this.prisma.materia.findUnique({
      where: { id },
      include: {
        ...materiaRelationsInclude,
        pautaItens: { include: { sessao: true } },
        normas: true,
      },
    });
    return assertFound(item, 'Matéria não encontrada');
  }

  async update(id: string, dto: UpdateMateriaDto) {
    await this.findOne(id);
    const {
      dataApresentacaoInicio: _di,
      dataApresentacaoFim: _df,
      ...rest
    } = dto;
    const { dataApresentacaoInicio, dataApresentacaoFim } =
      this.mapPresentationDates(dto);
    return this.prisma.materia.update({
      where: { id },
      data: { ...rest, dataApresentacaoInicio, dataApresentacaoFim },
      include: materiaRelationsInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.materia.delete({ where: { id } });
  }
}
