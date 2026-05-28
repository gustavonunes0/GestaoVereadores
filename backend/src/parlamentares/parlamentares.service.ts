import { Injectable } from '@nestjs/common';
import { assertFound } from '../common/prisma/assert-found';
import { paginatedQuery } from '../common/prisma/paginate';
import { parlamentarComPessoa } from '../common/prisma/prisma-includes';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParlamentarDto } from './dto/create-parlamentar.dto';
import { FilterParlamentarDto } from './dto/filter-parlamentar.dto';
import { UpdateParlamentarDto } from './dto/update-parlamentar.dto';

@Injectable()
export class ParlamentaresService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateParlamentarDto) {
    const { nome, cpf, email, ativo, mensagem } = dto;
    return this.prisma.parlamentar.create({
      data: {
        ativo: ativo ?? true,
        mensagem,
        pessoa: { create: { nome, cpf, email } },
      },
      include: parlamentarComPessoa.include,
    });
  }

  findAll(filters: FilterParlamentarDto) {
    const where =
      filters.ativo !== undefined ? { ativo: filters.ativo } : undefined;
    return paginatedQuery(
      () => this.prisma.parlamentar.count({ where }),
      (skip, take) =>
        this.prisma.parlamentar.findMany({
          where,
          include: parlamentarComPessoa.include,
          orderBy: { pessoa: { nome: 'asc' } },
          skip,
          take,
        }),
      filters,
    );
  }

  async findOne(id: string) {
    const item = await this.prisma.parlamentar.findUnique({
      where: { id },
      include: {
        ...parlamentarComPessoa.include,
        membrosComissao: { include: { comissao: true } },
        membrosFrente: { include: { frente: true } },
      },
    });
    return assertFound(item, 'Parlamentar não encontrado');
  }

  async update(id: string, dto: UpdateParlamentarDto) {
    await this.findOne(id);
    const { nome, cpf, email, ativo, mensagem } = dto;
    return this.prisma.parlamentar.update({
      where: { id },
      data: {
        ativo,
        mensagem,
        pessoa: {
          update: {
            nome,
            cpf,
            email,
          },
        },
      },
      include: parlamentarComPessoa.include,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.parlamentar.delete({ where: { id } });
  }
}
