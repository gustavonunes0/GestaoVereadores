import { Injectable, NotFoundException } from '@nestjs/common';
import { assertFound } from '../common/prisma/assert-found';
import { paginatedQuery } from '../common/prisma/paginate';
import { membrosComParlamentar } from '../common/prisma/prisma-includes';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AddMembroFrenteDto, CreateFrenteDto } from './dto/create-frente.dto';
import { UpdateFrenteDto } from './dto/update-frente.dto';

@Injectable()
export class FrentesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateFrenteDto) {
    return this.prisma.frenteParlamentar.create({ data: dto });
  }

  findAll(query: ListQueryDto) {
    return paginatedQuery(
      () => this.prisma.frenteParlamentar.count(),
      (skip, take) =>
        this.prisma.frenteParlamentar.findMany({
          include: { membros: membrosComParlamentar },
          orderBy: { nome: 'asc' },
          skip,
          take,
        }),
      query,
    );
  }

  async findOne(id: string) {
    const item = await this.prisma.frenteParlamentar.findUnique({
      where: { id },
      include: { membros: membrosComParlamentar },
    });
    return assertFound(item, 'Frente não encontrada');
  }

  async update(id: string, dto: UpdateFrenteDto) {
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

  async removeMembro(frenteId: string, membroId: string) {
    await this.findOne(frenteId);
    const membro = await this.prisma.frenteMembro.findFirst({
      where: { id: membroId, frenteId },
    });
    if (!membro) {
      throw new NotFoundException('Membro não encontrado nesta frente');
    }
    return this.prisma.frenteMembro.delete({ where: { id: membroId } });
  }
}
