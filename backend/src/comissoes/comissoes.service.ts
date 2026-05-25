import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddMembroComissaoDto, CreateComissaoDto } from './dto/create-comissao.dto';
import { UpdateComissaoDto } from './dto/update-comissao.dto';

@Injectable()
export class ComissoesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateComissaoDto) {
    return this.prisma.comissao.create({ data: dto });
  }

  findAll() {
    return this.prisma.comissao.findMany({
      include: { membros: { include: { parlamentar: { include: { pessoa: true } } } } },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.comissao.findUnique({
      where: { id },
      include: { membros: { include: { parlamentar: { include: { pessoa: true } } } } },
    });
    if (!item) throw new NotFoundException('Comissão não encontrada');
    return item;
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
    return this.prisma.comissaoMembro.delete({ where: { id: membroId } });
  }
}
