import { Injectable, NotFoundException } from '@nestjs/common';
import { toOptionalDate } from '../common/prisma/date-fields';
import { paginatedQuery } from '../common/prisma/paginate';
import { tenantWhere } from '../common/prisma/tenant-scope';
import { membrosComParlamentar } from '../common/prisma/prisma-includes';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AddMembroComissaoDto, CreateComissaoDto } from './dto/create-comissao.dto';
import { UpdateComissaoDto } from './dto/update-comissao.dto';

const comissaoInclude = {
  tipoComissao: true,
  membros: membrosComParlamentar,
} as const;

@Injectable()
export class ComissoesService {
  constructor(private readonly prisma: PrismaService) {}

  private mapDto(dto: CreateComissaoDto | UpdateComissaoDto) {
    const {
      dataCriacao,
      dataExtincao,
      dataHoraReuniao,
      dataInstalacao,
      dataPrevistaTermino,
      novoPrazo,
      dataTermino,
      sigla,
      email,
      ...rest
    } = dto;
    return {
      ...rest,
      sigla: sigla?.trim().toUpperCase() || undefined,
      email: email?.trim() || undefined,
      dataCriacao: toOptionalDate(dataCriacao),
      dataExtincao: toOptionalDate(dataExtincao),
      dataHoraReuniao: toOptionalDate(dataHoraReuniao),
      dataInstalacao: toOptionalDate(dataInstalacao),
      dataPrevistaTermino: toOptionalDate(dataPrevistaTermino),
      novoPrazo: toOptionalDate(novoPrazo),
      dataTermino: toOptionalDate(dataTermino),
    };
  }

  create(tenantId: string, dto: CreateComissaoDto) {
    return this.prisma.comissao.create({
      data: { ...this.mapDto(dto), tenantId, nome: dto.nome.trim() },
      include: comissaoInclude,
    });
  }

  findAll(tenantId: string, query: ListQueryDto) {
    const where = tenantWhere(tenantId);
    return paginatedQuery(
      () => this.prisma.comissao.count({ where }),
      (skip, take) =>
        this.prisma.comissao.findMany({
          where,
          include: comissaoInclude,
          orderBy: { nome: 'asc' },
          skip,
          take,
        }),
      query,
    );
  }

  async findOne(tenantId: string, id: string) {
    const item = await this.prisma.comissao.findFirst({
      where: { id, ...tenantWhere(tenantId) },
      include: comissaoInclude,
    });
    if (!item) throw new NotFoundException('Comissão não encontrada');
    return item;
  }

  async update(tenantId: string, id: string, dto: UpdateComissaoDto) {
    await this.findOne(tenantId, id);
    return this.prisma.comissao.update({
      where: { id },
      data: this.mapDto(dto),
      include: comissaoInclude,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.comissao.update({
      where: { id },
      data: { isRemoved: true },
    });
  }

  async addMembro(tenantId: string, comissaoId: string, dto: AddMembroComissaoDto) {
    await this.findOne(tenantId, comissaoId);
    return this.prisma.comissaoMembro.create({
      data: { comissaoId, ...dto },
      include: { parlamentar: { include: { pessoa: true } } },
    });
  }

  async removeMembro(tenantId: string, comissaoId: string, membroId: string) {
    await this.findOne(tenantId, comissaoId);
    const membro = await this.prisma.comissaoMembro.findFirst({
      where: { id: membroId, comissaoId },
    });
    if (!membro) {
      throw new NotFoundException('Membro não encontrado nesta comissão');
    }
    return this.prisma.comissaoMembro.delete({ where: { id: membroId } });
  }
}
