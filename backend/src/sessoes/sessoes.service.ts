import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { assertFound } from '../common/prisma/assert-found';
import { buildDateRangeFilter } from '../common/prisma/date-fields';
import { paginatedQuery } from '../common/prisma/paginate';
import { sessaoPlenariaInclude } from '../common/prisma/prisma-includes';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddPautaItemDto,
  CreateSessaoPlenariaDto,
  FilterSessaoPlenariaDto,
  RegistrarPresencaDto,
} from './dto/sessao.dto';
import { UpdateSessaoPlenariaDto } from './dto/update-sessao.dto';

@Injectable()
export class SessoesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSessaoPlenariaDto) {
    return this.prisma.sessaoPlenaria.create({
      data: {
        dataInicio: new Date(dto.dataInicio),
        tipoSessaoId: dto.tipoSessaoId,
        situacaoId: dto.situacaoId,
        sessaoLegislativaId: dto.sessaoLegislativaId,
        mensagem: dto.mensagem,
      },
      include: sessaoPlenariaInclude,
    });
  }

  findAll(filters: FilterSessaoPlenariaDto) {
    const where: Prisma.SessaoPlenariaWhereInput = {};
    if (filters.tipoSessaoId) where.tipoSessaoId = filters.tipoSessaoId;
    if (filters.situacaoId) where.situacaoId = filters.situacaoId;
    if (filters.sessaoLegislativaId) {
      where.sessaoLegislativaId = filters.sessaoLegislativaId;
    }
    const range = buildDateRangeFilter(
      filters.dataInicioDe,
      filters.dataInicioAte,
    );
    if (range) where.dataInicio = range;

    return paginatedQuery(
      () => this.prisma.sessaoPlenaria.count({ where }),
      (skip, take) =>
        this.prisma.sessaoPlenaria.findMany({
          where,
          include: sessaoPlenariaInclude,
          orderBy: { dataInicio: 'desc' },
          skip,
          take,
        }),
      filters,
    );
  }

  async findOne(id: string) {
    const item = await this.prisma.sessaoPlenaria.findUnique({
      where: { id },
      include: sessaoPlenariaInclude,
    });
    return assertFound(item, 'Sessão plenária não encontrada');
  }

  async update(id: string, dto: UpdateSessaoPlenariaDto) {
    await this.findOne(id);
    return this.prisma.sessaoPlenaria.update({
      where: { id },
      data: {
        dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
        tipoSessaoId: dto.tipoSessaoId,
        situacaoId: dto.situacaoId,
        sessaoLegislativaId: dto.sessaoLegislativaId,
        mensagem: dto.mensagem,
      },
      include: sessaoPlenariaInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sessaoPlenaria.delete({ where: { id } });
  }

  async addPautaItem(sessaoId: string, dto: AddPautaItemDto) {
    await this.findOne(sessaoId);
    return this.prisma.pautaItem.create({
      data: { sessaoId, materiaId: dto.materiaId, ordem: dto.ordem },
      include: { materia: true },
    });
  }

  async registrarPresenca(sessaoId: string, dto: RegistrarPresencaDto) {
    await this.findOne(sessaoId);
    return this.prisma.presencaSessao.upsert({
      where: {
        sessaoId_parlamentarId: {
          sessaoId,
          parlamentarId: dto.parlamentarId,
        },
      },
      create: {
        sessaoId,
        parlamentarId: dto.parlamentarId,
        presente: dto.presente ?? true,
      },
      update: { presente: dto.presente ?? true },
      include: { parlamentar: { include: { pessoa: true } } },
    });
  }
}
