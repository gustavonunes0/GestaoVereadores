import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParlamentarDto } from './dto/create-parlamentar.dto';
import { UpdateParlamentarDto } from './dto/update-parlamentar.dto';

const includeDefault = { pessoa: true };

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
      include: includeDefault,
    });
  }

  findAll(ativo?: boolean) {
    return this.prisma.parlamentar.findMany({
      where: ativo !== undefined ? { ativo } : undefined,
      include: includeDefault,
      orderBy: { pessoa: { nome: 'asc' } },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.parlamentar.findUnique({
      where: { id },
      include: {
        ...includeDefault,
        membrosComissao: { include: { comissao: true } },
        membrosFrente: { include: { frente: true } },
      },
    });
    if (!item) throw new NotFoundException('Parlamentar não encontrado');
    return item;
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
      include: includeDefault,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.parlamentar.delete({ where: { id } });
  }
}
