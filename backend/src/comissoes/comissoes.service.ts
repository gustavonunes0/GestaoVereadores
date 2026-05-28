import { Injectable, NotFoundException } from '@nestjs/common';
import { assertFound } from '../common/prisma/assert-found';
import { paginatedQuery } from '../common/prisma/paginate';
import { membrosComParlamentar } from '../common/prisma/prisma-includes';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AddMembroComissaoDto, CreateComissaoDto } from './dto/create-comissao.dto';
import { UpdateComissaoDto } from './dto/update-comissao.dto';

@Injectable()
export class ComissoesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateComissaoDto) {
    return this.prisma.comissao.create({ data: dto });
  }

  findAll(query: ListQueryDto) {
    return paginatedQuery(
      () => this.prisma.comissao.count(),
      (skip, take) =>
        this.prisma.comissao.findMany({
          include: { membros: membrosComParlamentar },
          orderBy: { nome: 'asc' },
          skip,
          take,
        }),
      query,
    );
  }

  async findOne(id: string) {
    const item = await this.prisma.comissao.findUnique({
      where: { id },
      include: { membros: membrosComParlamentar },
    });
    return assertFound(item, 'Comissão não encontrada');
  }

  async update(id: string, dto: UpdateComissaoDto) {
    await this.findOne(id);
    return this.prisma.comissao.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.comissao.delete({ where: { id } });
  }

  async addMembro(comissaoId: string, dto: AddMembroComissaoDto) {
    await this.findOne(comissaoId);
    return this.prisma.comissaoMembro.create({
      data: { comissaoId, ...dto },
      include: { parlamentar: { include: { pessoa: true } } },
    });
  }

  async removeMembro(comissaoId: string, membroId: string) {
    await this.findOne(comissaoId);
    const membro = await this.prisma.comissaoMembro.findFirst({
      where: { id: membroId, comissaoId },
    });
    if (!membro) {
      throw new NotFoundException('Membro não encontrado nesta comissão');
    }
    return this.prisma.comissaoMembro.delete({ where: { id: membroId } });
  }
}
