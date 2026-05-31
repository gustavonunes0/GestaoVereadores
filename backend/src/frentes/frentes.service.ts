import { Injectable, NotFoundException } from '@nestjs/common';
import { paginatedQuery } from '../common/prisma/paginate';
import { tenantWhere } from '../common/prisma/tenant-scope';
import { membrosComParlamentar } from '../common/prisma/prisma-includes';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AddMembroFrenteDto, CreateFrenteDto } from './dto/create-frente.dto';
import { UpdateFrenteDto } from './dto/update-frente.dto';

@Injectable()
export class FrentesService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, dto: CreateFrenteDto) {
    return this.prisma.frenteParlamentar.create({
      data: { ...dto, tenantId },
    });
  }

  findAll(tenantId: string, query: ListQueryDto) {
    const where = tenantWhere(tenantId);
    return paginatedQuery(
      () => this.prisma.frenteParlamentar.count({ where }),
      (skip, take) =>
        this.prisma.frenteParlamentar.findMany({
          where,
          include: { membros: membrosComParlamentar },
          orderBy: { nome: 'asc' },
          skip,
          take,
        }),
      query,
    );
  }

  async findOne(tenantId: string, id: string) {
    const item = await this.prisma.frenteParlamentar.findFirst({
      where: { id, ...tenantWhere(tenantId) },
      include: { membros: membrosComParlamentar },
    });
    if (!item) throw new NotFoundException('Frente não encontrada');
    return item;
  }

  async update(tenantId: string, id: string, dto: UpdateFrenteDto) {
    await this.findOne(tenantId, id);
    return this.prisma.frenteParlamentar.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.frenteParlamentar.update({
      where: { id },
      data: { isRemoved: true },
    });
  }

  async addMembro(tenantId: string, frenteId: string, dto: AddMembroFrenteDto) {
    await this.findOne(tenantId, frenteId);
    return this.prisma.frenteMembro.create({
      data: { frenteId, ...dto },
      include: { parlamentar: { include: { pessoa: true } } },
    });
  }

  async removeMembro(tenantId: string, frenteId: string, membroId: string) {
    await this.findOne(tenantId, frenteId);
    const membro = await this.prisma.frenteMembro.findFirst({
      where: { id: membroId, frenteId },
    });
    if (!membro) {
      throw new NotFoundException('Membro não encontrado nesta frente');
    }
    return this.prisma.frenteMembro.delete({ where: { id: membroId } });
  }
}
