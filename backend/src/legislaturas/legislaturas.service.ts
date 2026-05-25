import { Injectable, NotFoundException } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class CreateLegislaturaDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  numero: number;

  @IsDateString()
  dataInicio: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;
}

export class CreateSessaoLegislativaDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  numero: number;

  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;
}

@Injectable()
export class LegislaturasService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateLegislaturaDto) {
    return this.prisma.legislatura.create({
      data: {
        numero: dto.numero,
        dataInicio: new Date(dto.dataInicio),
        dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
      },
    });
  }

  findAll() {
    return this.prisma.legislatura.findMany({
      include: { sessoesLegislativas: true },
      orderBy: { numero: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.legislatura.findUnique({
      where: { id },
      include: {
        sessoesLegislativas: { include: { sessoesPlenarias: true } },
        mesasDiretoras: { include: { membros: true } },
      },
    });
    if (!item) throw new NotFoundException('Legislatura não encontrada');
    return item;
  }

  async createSessaoLegislativa(legislaturaId: string, dto: CreateSessaoLegislativaDto) {
    await this.findOne(legislaturaId);
    return this.prisma.sessaoLegislativa.create({
      data: {
        legislaturaId,
        numero: dto.numero,
        dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
        dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
      },
    });
  }
}
