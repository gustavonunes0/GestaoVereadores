import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { assertFound } from '../common/prisma/assert-found';
import { paginatedQuery } from '../common/prisma/paginate';
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

  create(dto: CreateAutorDto) {
    return this.prisma.autor.create({
      data: dto,
      include: autorInclude,
    });
  }

  findAll(filters: FilterAutorDto) {
    const where: Prisma.AutorWhereInput = {};
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

  async findOne(id: string) {
    const item = await this.prisma.autor.findUnique({
      where: { id },
      include: { ...autorInclude, materias: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
    return assertFound(item, 'Autor não encontrado');
  }

  async update(id: string, dto: UpdateAutorDto) {
    await this.findOne(id);
    return this.prisma.autor.update({
      where: { id },
      data: dto,
      include: autorInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.autor.delete({ where: { id } });
  }
}
