import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { paginatedQuery } from '../common/prisma/paginate';
import { tenantWhere } from '../common/prisma/tenant-scope';
import { parlamentarComPessoa } from '../common/prisma/prisma-includes';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAutorDto, FilterAutorDto, UpdateAutorDto } from './dto/autor.dto';

const autorInclude = {
  tipoAutor: true,
  parlamentar: parlamentarComPessoa,
} as const;

@Injectable()
export class AutoresService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, dto: CreateAutorDto) {
    return this.prisma.autor.create({
      data: { ...dto, tenantId },
      include: autorInclude,
    });
  }

  findAll(tenantId: string, filters: FilterAutorDto) {
    const where: Prisma.AutorWhereInput = { ...tenantWhere(tenantId) };
    if (filters.tipoAutorId) where.tipoAutorId = filters.tipoAutorId;
    if (filters.parlamentarId) where.parlamentarId = filters.parlamentarId;
    if (filters.nome) where.nome = { contains: filters.nome };

    return paginatedQuery(
      () => this.prisma.autor.count({ where }),
      (skip, take) =>
        this.prisma.autor.findMany({
          where,
          include: autorInclude,
          orderBy: { nome: 'asc' },
          skip,
          take,
        }),
      filters,
    );
  }

  async findOne(tenantId: string, id: string) {
    const item = await this.prisma.autor.findFirst({
      where: { id, ...tenantWhere(tenantId) },
      include: { ...autorInclude, materias: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
    if (!item) throw new NotFoundException('Autor não encontrado');
    return item;
  }

  async update(tenantId: string, id: string, dto: UpdateAutorDto) {
    await this.findOne(tenantId, id);
    return this.prisma.autor.update({
      where: { id },
      data: dto,
      include: autorInclude,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.autor.update({
      where: { id },
      data: { isRemoved: true },
    });
  }
}
