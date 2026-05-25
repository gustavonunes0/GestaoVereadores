import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class CreateNormaDto {
  @IsString()
  tipoId: string;

  @IsString()
  numero: string;

  @IsString()
  @MinLength(3)
  ementa: string;

  @IsOptional()
  @IsString()
  anoId?: string;

  @IsOptional()
  @IsDateString()
  data?: string;

  @IsOptional()
  @IsString()
  esferaFederacaoId?: string;

  @IsOptional()
  @IsString()
  identificadorId?: string;

  @IsOptional()
  @IsString()
  materiaOrigemId?: string;
}

export class FilterNormaDto {
  @IsOptional()
  @IsString()
  tipoId?: string;

  @IsOptional()
  @IsString()
  anoId?: string;

  @IsOptional()
  @IsString()
  numero?: string;
}

@Injectable()
export class NormasService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateNormaDto) {
    return this.prisma.norma.create({
      data: {
        ...dto,
        data: dto.data ? new Date(dto.data) : undefined,
      },
      include: { tipo: true, ano: true, materiaOrigem: true },
    });
  }

  findAll(filters: FilterNormaDto) {
    const where: Prisma.NormaWhereInput = {};
    if (filters.tipoId) where.tipoId = filters.tipoId;
    if (filters.anoId) where.anoId = filters.anoId;
    if (filters.numero) where.numero = { contains: filters.numero };
    return this.prisma.norma.findMany({
      where,
      include: { tipo: true, ano: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.norma.findUnique({
      where: { id },
      include: { tipo: true, ano: true, materiaOrigem: true, esferaFederacao: true },
    });
    if (!item) throw new NotFoundException('Norma não encontrada');
    return item;
  }
}
