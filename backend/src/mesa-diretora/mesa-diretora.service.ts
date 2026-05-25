import { Injectable, NotFoundException } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class CreateMesaDiretoraDto {
  @IsString()
  legislaturaId: string;

  @IsOptional()
  @IsString()
  sessaoId?: string;

  @IsOptional()
  @IsString()
  mensagem?: string;
}

export class AddMembroMesaDto {
  @IsString()
  parlamentarId: string;

  @IsString()
  cargoId: string;
}

@Injectable()
export class MesaDiretoraService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateMesaDiretoraDto) {
    return this.prisma.mesaDiretora.create({
      data: dto,
      include: {
        legislatura: true,
        sessao: true,
        membros: {
          include: {
            parlamentar: { include: { pessoa: true } },
            cargo: true,
          },
        },
      },
    });
  }

  findAll() {
    return this.prisma.mesaDiretora.findMany({
      include: {
        legislatura: true,
        membros: {
          include: {
            parlamentar: { include: { pessoa: true } },
            cargo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.mesaDiretora.findUnique({
      where: { id },
      include: {
        legislatura: true,
        sessao: true,
        membros: {
          include: {
            parlamentar: { include: { pessoa: true } },
            cargo: true,
          },
        },
      },
    });
    if (!item) throw new NotFoundException('Mesa diretora não encontrada');
    return item;
  }

  async addMembro(mesaId: string, dto: AddMembroMesaDto) {
    await this.findOne(mesaId);
    return this.prisma.mesaDiretoraMembro.create({
      data: { mesaId, ...dto },
      include: {
        parlamentar: { include: { pessoa: true } },
        cargo: true,
      },
    });
  }
}
