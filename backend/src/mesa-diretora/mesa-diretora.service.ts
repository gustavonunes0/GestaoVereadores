import { Injectable, NotFoundException } from '@nestjs/common';
import { paginatedQuery } from '../common/prisma/paginate';
import { tenantWhere } from '../common/prisma/tenant-scope';
import { mesaDiretoraInclude } from '../common/prisma/prisma-includes';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AddMembroMesaDto, CreateMesaDiretoraDto } from './dto/mesa-diretora.dto';

@Injectable()
export class MesaDiretoraService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, dto: CreateMesaDiretoraDto) {
    return this.prisma.mesaDiretora.create({
      data: { ...dto, tenantId },
      include: mesaDiretoraInclude,
    });
  }

  findAll(tenantId: string, query: ListQueryDto) {
    const where = tenantWhere(tenantId);
    return paginatedQuery(
      () => this.prisma.mesaDiretora.count({ where }),
      (skip, take) =>
        this.prisma.mesaDiretora.findMany({
          where,
          include: mesaDiretoraInclude,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
      query,
    );
  }

  async findOne(tenantId: string, id: string) {
    const item = await this.prisma.mesaDiretora.findFirst({
      where: { id, ...tenantWhere(tenantId) },
      include: mesaDiretoraInclude,
    });
    if (!item) throw new NotFoundException('Mesa diretora não encontrada');
    return item;
  }

  async addMembro(tenantId: string, mesaId: string, dto: AddMembroMesaDto) {
    await this.findOne(tenantId, mesaId);
    return this.prisma.mesaDiretoraMembro.create({
      data: { mesaId, ...dto },
      include: {
        parlamentar: { include: { pessoa: true } },
        cargo: true,
      },
    });
  }

  async removeMembro(tenantId: string, mesaId: string, membroId: string) {
    await this.findOne(tenantId, mesaId);
    const membro = await this.prisma.mesaDiretoraMembro.findFirst({
      where: { id: membroId, mesaId },
    });
    if (!membro) {
      throw new NotFoundException('Membro não encontrado nesta mesa diretora');
    }
    return this.prisma.mesaDiretoraMembro.delete({ where: { id: membroId } });
  }
}
