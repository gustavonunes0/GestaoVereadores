import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddPautaItemDto,
  CreateSessaoPlenariaDto,
  FilterSessaoPlenariaDto,
  RegistrarPresencaDto,
} from './dto/sessao.dto';

const sessaoInclude = {
  tipoSessao: true,
  situacao: true,
  sessaoLegislativa: { include: { legislatura: true } },
  pautaItens: { include: { materia: true }, orderBy: { ordem: 'asc' as const } },
  presencas: { include: { parlamentar: { include: { pessoa: true } } } },
};

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
      include: sessaoInclude,
    });
  }

  findAll(filters: FilterSessaoPlenariaDto) {
    const where: Prisma.SessaoPlenariaWhereInput = {};
    if (filters.tipoSessaoId) where.tipoSessaoId = filters.tipoSessaoId;
    if (filters.situacaoId) where.situacaoId = filters.situacaoId;
    if (filters.sessaoLegislativaId) {
      where.sessaoLegislativaId = filters.sessaoLegislativaId;
    }
    if (filters.dataInicioDe || filters.dataInicioAte) {
      where.dataInicio = {};
      if (filters.dataInicioDe) {
        where.dataInicio.gte = new Date(filters.dataInicioDe);
      }
      if (filters.dataInicioAte) {
        where.dataInicio.lte = new Date(filters.dataInicioAte);
      }
    }
    return this.prisma.sessaoPlenaria.findMany({
      where,
      include: sessaoInclude,
      orderBy: { dataInicio: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.sessaoPlenaria.findUnique({
      where: { id },
      include: sessaoInclude,
    });
    if (!item) throw new NotFoundException('Sessão plenária não encontrada');
    return item;
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
