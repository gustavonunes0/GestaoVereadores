import { Injectable } from '@nestjs/common';
import { assertFound } from '../common/prisma/assert-found';
import { paginatedQuery } from '../common/prisma/paginate';
import { mesaDiretoraInclude } from '../common/prisma/prisma-includes';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AddMembroMesaDto, CreateMesaDiretoraDto } from './dto/mesa-diretora.dto';

@Injectable()
export class MesaDiretoraService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateMesaDiretoraDto) {
    return this.prisma.mesaDiretora.create({
      data: dto,
      include: mesaDiretoraInclude,
    });
  }

  findAll(query: ListQueryDto) {
    return paginatedQuery(
      () => this.prisma.mesaDiretora.count(),
      (skip, take) =>
        this.prisma.mesaDiretora.findMany({
          include: mesaDiretoraInclude,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
      query,
    );
  }

  async findOne(id: string) {
    const item = await this.prisma.mesaDiretora.findUnique({
      where: { id },
      include: mesaDiretoraInclude,
    });
    return assertFound(item, 'Mesa diretora não encontrada');
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
