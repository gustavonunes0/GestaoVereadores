import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class CreateAtoDto {
  @IsString()
  tipoId: string;

  @IsString()
  classificacaoId: string;

  @IsString()
  numero: string;

  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;
}

export class FilterAtoDto {
  @IsOptional()
  @IsString()
  tipoId?: string;

  @IsOptional()
  @IsString()
  classificacaoId?: string;
}

@Injectable()
export class AtosService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAtoDto) {
    return this.prisma.ato.create({
      data: {
        ...dto,
        dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
        dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
      },
      include: { tipo: true, classificacao: true },
    });
  }

  findAll(filters: FilterAtoDto) {
    const where: Prisma.AtoWhereInput = {};
    if (filters.tipoId) where.tipoId = filters.tipoId;
    if (filters.classificacaoId) where.classificacaoId = filters.classificacaoId;
    return this.prisma.ato.findMany({
      where,
      include: { tipo: true, classificacao: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.ato.findUnique({
      where: { id },
      include: { tipo: true, classificacao: true },
    });
    if (!item) throw new NotFoundException('Ato não encontrado');
    return item;
  }
}
