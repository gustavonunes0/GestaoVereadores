import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StatusMateria } from '@prisma/client';
import { toOptionalDate } from '../common/prisma/date-fields';
import { paginatedQuery } from '../common/prisma/paginate';
import { tenantWhere } from '../common/prisma/tenant-scope';
import { materiaRelationsInclude } from '../common/prisma/prisma-includes';
import { PrismaService } from '../prisma/prisma.service';
import { AlterarStatusMateriaDto } from './dto/alterar-status-materia.dto';
import { AdicionarMateriaAutorDto } from './dto/materia-autor.dto';
import { CreateMateriaDto, FilterMateriaDto } from './dto/materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';
import {
  assertTransicaoStatusPermitida,
  syncEmTramitacaoFromStatus,
} from './domain/materia-workflow';

type TramitacaoEntry = {
  status: StatusMateria;
  observacao?: string;
  em: string;
};

@Injectable()
export class MateriasService {
  constructor(private readonly prisma: PrismaService) {}

  private mapPresentationDates(dto: {
    dataApresentacaoInicio?: string;
    dataApresentacaoFim?: string;
  }) {
    return {
      dataApresentacaoInicio: toOptionalDate(dto.dataApresentacaoInicio),
      dataApresentacaoFim: toOptionalDate(dto.dataApresentacaoFim),
    };
  }

  private resolveStatus(dto: { status?: StatusMateria; emTramitacao?: boolean }) {
    if (dto.status) return dto.status;
    if (dto.emTramitacao === false) return StatusMateria.ARQUIVADA;
    return StatusMateria.EM_TRAMITACAO;
  }

  private appendTramitacao(
    atual: Prisma.JsonValue,
    entry: TramitacaoEntry,
  ): Prisma.InputJsonValue {
    const lista = Array.isArray(atual) ? [...(atual as TramitacaoEntry[])] : [];
    lista.push(entry);
    return lista as Prisma.InputJsonValue;
  }

  private async assertParlamentaresDoTenant(
    tenantId: string,
    parlamentarIds: string[],
  ) {
    const count = await this.prisma.parlamentar.count({
      where: {
        id: { in: parlamentarIds },
        ...tenantWhere(tenantId),
      },
    });
    if (count !== parlamentarIds.length) {
      throw new BadRequestException(
        'Um ou mais representantes não pertencem a esta câmara',
      );
    }
  }

  private async syncRepresentantes(
    tenantId: string,
    materiaId: string,
    representanteIds?: string[],
  ) {
    if (representanteIds === undefined) return;
    await this.prisma.materiaRepresentante.deleteMany({ where: { materiaId } });
    if (!representanteIds.length) return;

    await this.assertParlamentaresDoTenant(tenantId, representanteIds);
    await this.prisma.materiaRepresentante.createMany({
      data: representanteIds.map((parlamentarId, index) => ({
        materiaId,
        parlamentarId,
        ordem: index + 1,
      })),
    });
  }

  private async syncCoautores(
    tenantId: string,
    materiaId: string,
    coautorIds?: string[],
    autorParlamentarId?: string | null,
  ) {
    if (coautorIds === undefined) return;
    await this.prisma.materiaCoautor.deleteMany({ where: { materiaId } });
    const ids = coautorIds.filter((id) => id !== autorParlamentarId);
    if (!ids.length) return;

    await this.assertParlamentaresDoTenant(tenantId, ids);
    await this.prisma.materiaCoautor.createMany({
      data: ids.map((parlamentarId, index) => ({
        materiaId,
        parlamentarId,
        ordem: index + 1,
      })),
    });
  }

  private async assertNumeroUnico(
    tenantId: string,
    tipoId: string,
    numero: number,
    anoId: string,
    ignoreMateriaId?: string,
  ) {
    const existente = await this.prisma.materia.findFirst({
      where: {
        tenantId,
        tipoId,
        numero,
        anoId,
        isRemoved: false,
        ...(ignoreMateriaId ? { id: { not: ignoreMateriaId } } : {}),
      },
    });
    if (existente) {
      throw new ConflictException(
        'Já existe matéria com este tipo, número e ano nesta câmara',
      );
    }
  }

  async create(tenantId: string, dto: CreateMateriaDto) {
    const status = this.resolveStatus(dto);
    if (dto.numero !== undefined && dto.anoId) {
      await this.assertNumeroUnico(tenantId, dto.tipoId, dto.numero, dto.anoId);
    }

    const {
      dataApresentacaoInicio: _di,
      dataApresentacaoFim: _df,
      status: _status,
      emTramitacao: _em,
      representanteIds,
      coautorIds,
      ...rest
    } = dto;
    const { dataApresentacaoInicio, dataApresentacaoFim } =
      this.mapPresentationDates(dto);

    const primeiroAutorId =
      representanteIds?.[0] ?? rest.primeiroAutorId;

    const materia = await this.prisma.materia.create({
      data: {
        ...rest,
        primeiroAutorId,
        tenantId,
        dataApresentacaoInicio,
        dataApresentacaoFim,
        status,
        emTramitacao: syncEmTramitacaoFromStatus(status),
        tramitacaoJson: this.appendTramitacao([], {
          status,
          observacao: 'Cadastro da matéria',
          em: new Date().toISOString(),
        }),
      },
    });

    await this.syncRepresentantes(tenantId, materia.id, representanteIds);
    await this.syncCoautores(
      tenantId,
      materia.id,
      coautorIds,
      primeiroAutorId,
    );
    return this.findOne(tenantId, materia.id);
  }

  findAll(tenantId: string, filters: FilterMateriaDto) {
    const where: Prisma.MateriaWhereInput = { ...tenantWhere(tenantId) };
    if (filters.tipoId) where.tipoId = filters.tipoId;
    if (filters.anoId) where.anoId = filters.anoId;
    if (filters.tematicaId) where.tematicaId = filters.tematicaId;
    if (filters.autorId) where.autorId = filters.autorId;
    if (filters.relatorId) where.relatorId = filters.relatorId;
    if (filters.statusTramitacaoId) {
      where.statusTramitacaoId = filters.statusTramitacaoId;
    }
    if (filters.status) {
      where.status = filters.status;
    } else if (filters.emTramitacao !== undefined) {
      where.emTramitacao = filters.emTramitacao;
    }
    if (filters.numero) where.numero = filters.numero;
    if (filters.ementa) {
      where.ementa = { contains: filters.ementa };
    }
    return paginatedQuery(
      () => this.prisma.materia.count({ where }),
      (skip, take) =>
        this.prisma.materia.findMany({
          where,
          include: materiaRelationsInclude,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
      filters,
    );
  }

  async findOne(tenantId: string, id: string) {
    const item = await this.prisma.materia.findFirst({
      where: { id, ...tenantWhere(tenantId) },
      include: {
        ...materiaRelationsInclude,
        pautaItens: {
          where: { isRemoved: false },
          include: { sessao: { include: { situacao: true } } },
        },
        normas: true,
      },
    });
    if (!item) throw new NotFoundException('Matéria não encontrada');
    return item;
  }

  async update(tenantId: string, id: string, dto: UpdateMateriaDto) {
    const atual = await this.findOne(tenantId, id);

    if (
      dto.numero !== undefined &&
      (dto.anoId ?? atual.anoId) &&
      (dto.tipoId ?? atual.tipoId)
    ) {
      await this.assertNumeroUnico(
        tenantId,
        dto.tipoId ?? atual.tipoId,
        dto.numero ?? atual.numero!,
        dto.anoId ?? atual.anoId!,
        id,
      );
    }

    const {
      dataApresentacaoInicio: _di,
      dataApresentacaoFim: _df,
      status: _status,
      emTramitacao: _em,
      representanteIds,
      coautorIds,
      ...rest
    } = dto;
    const { dataApresentacaoInicio, dataApresentacaoFim } =
      this.mapPresentationDates(dto);

    let primeiroAutorId = rest.primeiroAutorId;
    if (representanteIds !== undefined) {
      primeiroAutorId = representanteIds.length > 0 ? representanteIds[0] : undefined;
    }

    let status = atual.status;
    if (dto.status !== undefined) {
      assertTransicaoStatusPermitida(atual.status, dto.status);
      status = dto.status;
    } else if (dto.emTramitacao !== undefined) {
      status = dto.emTramitacao
        ? StatusMateria.EM_TRAMITACAO
        : StatusMateria.ARQUIVADA;
    }

    await this.prisma.materia.update({
      where: { id },
      data: {
        ...rest,
        primeiroAutorId,
        dataApresentacaoInicio,
        dataApresentacaoFim,
        status,
        emTramitacao: syncEmTramitacaoFromStatus(status),
      },
    });

    await this.syncRepresentantes(tenantId, id, representanteIds);
    await this.syncCoautores(
      tenantId,
      id,
      coautorIds,
      primeiroAutorId ?? atual.primeiroAutorId,
    );
    return this.findOne(tenantId, id);
  }

  async alterarStatus(
    tenantId: string,
    id: string,
    dto: AlterarStatusMateriaDto,
  ) {
    const materia = await this.findOne(tenantId, id);
    assertTransicaoStatusPermitida(materia.status, dto.status);

    return this.prisma.materia.update({
      where: { id },
      data: {
        status: dto.status,
        emTramitacao: syncEmTramitacaoFromStatus(dto.status),
        tramitacaoJson: this.appendTramitacao(materia.tramitacaoJson, {
          status: dto.status,
          observacao: dto.observacao,
          em: new Date().toISOString(),
        }),
      },
      include: materiaRelationsInclude,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.materia.update({
      where: { id },
      data: { isRemoved: true },
    });
  }

  async listarAutores(tenantId: string, materiaId: string) {
    await this.findOne(tenantId, materiaId);
    return this.prisma.materiaAutor.findMany({
      where: { materiaId },
      include: { autor: true },
      orderBy: { ordem: 'asc' },
    });
  }

  async adicionarAutor(
    tenantId: string,
    materiaId: string,
    dto: AdicionarMateriaAutorDto,
  ) {
    await this.findOne(tenantId, materiaId);

    const autor = await this.prisma.autor.findFirst({
      where: { id: dto.autorId, ...tenantWhere(tenantId), isRemoved: false },
    });
    if (!autor) throw new NotFoundException('Autor não encontrado');

    const ordemOcupada = await this.prisma.materiaAutor.findFirst({
      where: { materiaId, ordem: dto.ordem },
    });
    if (ordemOcupada) {
      throw new ConflictException(`Ordem ${dto.ordem} já está em uso nesta matéria`);
    }

    try {
      return await this.prisma.materiaAutor.create({
        data: {
          materiaId,
          autorId: dto.autorId,
          ordem: dto.ordem,
        },
        include: { autor: true },
      });
    } catch {
      throw new ConflictException('Autor já vinculado a esta matéria');
    }
  }

  async removerAutor(tenantId: string, materiaId: string, materiaAutorId: string) {
    await this.findOne(tenantId, materiaId);

    const vínculo = await this.prisma.materiaAutor.findFirst({
      where: { id: materiaAutorId, materiaId },
    });
    if (!vínculo) throw new NotFoundException('Vínculo autor/matéria não encontrado');

    return this.prisma.materiaAutor.delete({ where: { id: materiaAutorId } });
  }
}
