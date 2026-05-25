import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateFrenteDto {
  @IsString()
  @MinLength(2)
  nome: string;

  @IsOptional()
  @IsString()
  mensagem?: string;

  @IsOptional()
  @IsBoolean()
  ativa?: boolean;
}

export class AddMembroFrenteDto {
  @IsString()
  parlamentarId: string;
}

@Injectable()
export class FrentesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateFrenteDto) {
    return this.prisma.frenteParlamentar.create({ data: dto });
  }

  findAll() {
    return this.prisma.frenteParlamentar.findMany({
      include: { membros: { include: { parlamentar: { include: { pessoa: true } } } } },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.frenteParlamentar.findUnique({
      where: { id },
      include: { membros: { include: { parlamentar: { include: { pessoa: true } } } } },
    });
    if (!item) throw new NotFoundException('Frente não encontrada');
    return item;
  }

  async update(id: string, dto: Partial<CreateFrenteDto>) {
    await this.findOne(id);
    return this.prisma.frenteParlamentar.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.frenteParlamentar.delete({ where: { id } });
  }

  async addMembro(frenteId: string, dto: AddMembroFrenteDto) {
    await this.findOne(frenteId);
    return this.prisma.frenteMembro.create({
      data: { frenteId, ...dto },
      include: { parlamentar: { include: { pessoa: true } } },
    });
  }
}
