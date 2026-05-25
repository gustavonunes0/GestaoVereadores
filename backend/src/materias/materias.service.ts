import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMateriaDto, FilterMateriaDto } from './dto/materia.dto';

const materiaInclude = {
  tipo: true,
  ano: true,
  tematica: true,
  origem: true,
  autor: true,
  primeiroAutor: { include: { pessoa: true } },
  relator: { include: { pessoa: true } },
  statusTramitacao: true,
  unidadeTramitacaoDestino: true,
};

@Injectable()
export class MateriasService {
  constructor(private readonly prisma: PrismaService) {}

  private mapDates(dto: CreateMateriaDto) {
    return {
      ...dto,
      dataApresentacaoInicio: dto.dataApresentacaoInicio
        ? new Date(dto.dataApresentacaoInicio)
        : undefined,
      dataApresentacaoFim: dto.dataApresentacaoFim
        ? new Date(dto.dataApresentacaoFim)
        : undefined,
    };
  }

  create(dto: CreateMateriaDto) {
    const { dataApresentacaoInicio, dataApresentacaoFim, ...rest } =
      this.mapDates(dto);
    return this.prisma.materia.create({
      data: {
        ...rest,
        dataApresentacaoInicio,
        dataApresentacaoFim,
        emTramitacao: dto.emTramitacao ?? true,
      },
      include: materiaInclude,
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
    return this.prisma.materia.findMany({
      where,
      include: materiaInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.materia.findUnique({
      where: { id },
      include: {
        ...materiaInclude,
        pautaItens: { include: { sessao: true } },
        normas: true,
      },
    });
    if (!item) throw new NotFoundException('Matéria não encontrada');
    return item;
  }

  async update(id: string, dto: Partial<CreateMateriaDto>) {
    await this.findOne(id);
    const { dataApresentacaoInicio, dataApresentacaoFim, ...rest } =
      this.mapDates(dto as CreateMateriaDto);
    return this.prisma.materia.update({
      where: { id },
      data: { ...rest, dataApresentacaoInicio, dataApresentacaoFim },
      include: materiaInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.materia.delete({ where: { id } });
  }
}
