import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DominiosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string) {
    return Promise.all([
      this.prisma.ano.findMany({ orderBy: { valor: 'desc' } }),
      this.prisma.tipoMateria.findMany({
        where: { tenantId },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.tipoListagem.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.tematica.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.origemMateria.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.localOrigemExterna.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.tipoNorma.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.esferaFederacao.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.identificadorNorma.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.tipoSessao.findMany({
        where: { tenantId },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.situacaoSessao.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.tipoAutor.findMany({
        where: { tenantId },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.statusTramitacao.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.unidadeTramitacao.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.cargoMesa.findMany({
        where: { tenantId },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.tipoAto.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.classificacaoAto.findMany({ orderBy: { nome: 'asc' } }),
    ]).then(
      ([
        anos,
        tiposMateria,
        tiposListagem,
        tematicas,
        origensMateria,
        locaisOrigemExterna,
        tiposNorma,
        esferasFederacao,
        identificadoresNorma,
        tiposSessao,
        situacoesSessao,
        tiposAutor,
        statusTramitacao,
        unidadesTramitacao,
        cargosMesa,
        tiposAto,
        classificacoesAto,
      ]) => ({
        anos,
        tiposMateria,
        tiposListagem,
        tematicas,
        origensMateria,
        locaisOrigemExterna,
        tiposNorma,
        esferasFederacao,
        identificadoresNorma,
        tiposSessao,
        situacoesSessao,
        tiposAutor,
        statusTramitacao,
        unidadesTramitacao,
        cargosMesa,
        tiposAto,
        classificacoesAto,
      }),
    );
  }
}
