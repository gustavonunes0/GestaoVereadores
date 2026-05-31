import { Injectable, NotFoundException } from '@nestjs/common';
import { paginatedQuery } from '../common/prisma/paginate';
import { tenantWhere } from '../common/prisma/tenant-scope';
import { parlamentarComPessoa } from '../common/prisma/prisma-includes';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParlamentarDto } from './dto/create-parlamentar.dto';
import { FilterParlamentarDto } from './dto/filter-parlamentar.dto';
import { UpdateParlamentarDto } from './dto/update-parlamentar.dto';

@Injectable()
export class ParlamentaresService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, dto: CreateParlamentarDto) {
    const { nome, cpf, email, ativo, mensagem } = dto;
    return this.prisma.parlamentar.create({
      data: {
        tenant: { connect: { id: tenantId } },
        ativo: ativo ?? true,
        mensagem,
        pessoa: { create: { nome, cpf, email } },
      },
      include: parlamentarComPessoa.include,
    });
  }

  findAll(tenantId: string, filters: FilterParlamentarDto) {
    const where = {
      ...tenantWhere(tenantId),
      ...(filters.ativo !== undefined ? { ativo: filters.ativo } : {}),
    };
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

  async findOne(tenantId: string, id: string) {
    const item = await this.prisma.parlamentar.findFirst({
      where: { id, ...tenantWhere(tenantId) },
      include: {
        ...parlamentarComPessoa.include,
        membrosComissao: { include: { comissao: true } },
        membrosFrente: { include: { frente: true } },
      },
    });
    if (!item) {
      throw new NotFoundException('Parlamentar não encontrado');
    }
    return item;
  }

  async update(tenantId: string, id: string, dto: UpdateParlamentarDto) {
    await this.findOne(tenantId, id);
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

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.parlamentar.update({
      where: { id },
      data: { isRemoved: true },
    });
  }
}
