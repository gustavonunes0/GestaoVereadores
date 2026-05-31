import { Injectable, NotFoundException } from '@nestjs/common';
import { toOptionalDate } from '../common/prisma/date-fields';
import { paginatedQuery } from '../common/prisma/paginate';
import { parlamentarComPessoa } from '../common/prisma/prisma-includes';
import { tenantWhere } from '../common/prisma/tenant-scope';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateParlamentarDto,
  MandatoParlamentarDto,
} from './dto/create-parlamentar.dto';
import { FilterParlamentarDto } from './dto/filter-parlamentar.dto';
import { UpdateParlamentarDto } from './dto/update-parlamentar.dto';

const parlamentarInclude = {
  ...parlamentarComPessoa.include,
  mandatos: {
    include: { legislatura: true },
    orderBy: { legislatura: { numero: 'desc' as const } },
  },
} as const;

function trimOrUndefined(value?: string) {
  const t = value?.trim();
  return t || undefined;
}

@Injectable()
export class ParlamentaresService {
  constructor(private readonly prisma: PrismaService) {}

  private mapPessoaFields(
    dto: CreateParlamentarDto | UpdateParlamentarDto,
    fallbackNome?: string,
  ) {
    const {
      nome,
      nomeParlamentar,
      cpf,
      rg,
      tituloEleitor,
      dataNascimento,
      sexo,
      email,
      telefone,
      celular,
      cep,
      logradouro,
      numeroEndereco,
      complemento,
      bairro,
      cidade,
      uf,
      site,
    } = dto;
    const resolvedNome = (nome ?? fallbackNome)?.trim();
    return {
      ...(resolvedNome ? { nome: resolvedNome } : {}),
      nomeParlamentar: trimOrUndefined(nomeParlamentar),
      cpf: trimOrUndefined(cpf),
      rg: trimOrUndefined(rg),
      tituloEleitor: trimOrUndefined(tituloEleitor),
      dataNascimento: toOptionalDate(dataNascimento),
      sexo: trimOrUndefined(sexo),
      email: trimOrUndefined(email),
      telefone: trimOrUndefined(telefone),
      celular: trimOrUndefined(celular),
      cep: trimOrUndefined(cep),
      logradouro: trimOrUndefined(logradouro),
      numeroEndereco: trimOrUndefined(numeroEndereco),
      complemento: trimOrUndefined(complemento),
      bairro: trimOrUndefined(bairro),
      cidade: trimOrUndefined(cidade),
      uf: trimOrUndefined(uf)?.toUpperCase(),
      site: trimOrUndefined(site),
    };
  }

  private mapParlamentarFields(dto: CreateParlamentarDto | UpdateParlamentarDto) {
    const {
      partido,
      profissao,
      gabinete,
      situacaoMilitar,
      nivelInstrucao,
      fotoUrl,
      biografia,
      ativo,
      mensagem,
    } = dto;
    return {
      partido: trimOrUndefined(partido),
      profissao: trimOrUndefined(profissao),
      gabinete: trimOrUndefined(gabinete),
      situacaoMilitar: trimOrUndefined(situacaoMilitar),
      nivelInstrucao: trimOrUndefined(nivelInstrucao),
      fotoUrl: trimOrUndefined(fotoUrl),
      biografia: trimOrUndefined(biografia),
      ativo,
      mensagem: trimOrUndefined(mensagem),
    };
  }

  private mapMandatoData(dto: MandatoParlamentarDto) {
    return {
      legislaturaId: dto.legislaturaId,
      titular: dto.titular ?? true,
      ativo: dto.ativo ?? true,
      dataPosse: toOptionalDate(dto.dataPosse),
      dataFim: toOptionalDate(dto.dataFim),
      dataExpedicaoDiploma: toOptionalDate(dto.dataExpedicaoDiploma),
    };
  }

  private async syncMandatos(
    parlamentarId: string,
    mandatos?: MandatoParlamentarDto[],
  ) {
    if (mandatos === undefined) return;
    const ids = mandatos.map((m) => m.id).filter(Boolean) as string[];
    await this.prisma.parlamentarMandato.deleteMany({
      where: {
        parlamentarId,
        ...(ids.length ? { id: { notIn: ids } } : {}),
      },
    });
    for (const m of mandatos) {
      const data = this.mapMandatoData(m);
      if (m.id) {
        await this.prisma.parlamentarMandato.updateMany({
          where: { id: m.id, parlamentarId },
          data,
        });
      } else {
        await this.prisma.parlamentarMandato.create({
          data: { parlamentarId, ...data },
        });
      }
    }
  }

  async create(tenantId: string, dto: CreateParlamentarDto) {
    const { mandatos, ...rest } = dto;
    const pessoaData = this.mapPessoaFields(rest, rest.nome);
    const parlamentarData = this.mapParlamentarFields(rest);
    const { ativo, ...parlamentarRest } = parlamentarData;
    const created = await this.prisma.parlamentar.create({
      data: {
        tenant: { connect: { id: tenantId } },
        ativo: ativo ?? true,
        ...parlamentarRest,
        pessoa: {
          create: {
            ...pessoaData,
            nome: rest.nome.trim(),
          },
        },
      },
      include: parlamentarInclude,
    });
    await this.syncMandatos(created.id, mandatos);
    return this.findOne(tenantId, created.id);
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
          include: parlamentarInclude,
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
        ...parlamentarInclude,
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
    const existing = await this.findOne(tenantId, id);
    const { mandatos, ...rest } = dto;
    const pessoaData = this.mapPessoaFields(rest, existing.pessoa.nome);
    const parlamentarData = this.mapParlamentarFields(rest);
    await this.prisma.parlamentar.update({
      where: { id },
      data: {
        ...parlamentarData,
        pessoa: { update: pessoaData },
      },
    });
    await this.syncMandatos(id, mandatos);
    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.parlamentar.update({
      where: { id },
      data: { isRemoved: true },
    });
  }
}
