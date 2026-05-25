import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DominiosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return Promise.all([
      this.prisma.ano.findMany({ orderBy: { valor: 'desc' } }),
      this.prisma.tipoMateria.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.tipoNorma.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.tipoSessao.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.situacaoSessao.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.tipoAutor.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.tematica.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.statusTramitacao.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.unidadeTramitacao.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.cargoMesa.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.tipoAto.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.classificacaoAto.findMany({ orderBy: { nome: 'asc' } }),
    ]).then(
      ([
        anos,
        tiposMateria,
        tiposNorma,
        tiposSessao,
        situacoesSessao,
        tiposAutor,
        tematicas,
        statusTramitacao,
        unidadesTramitacao,
        cargosMesa,
        tiposAto,
        classificacoesAto,
      ]) => ({
        anos,
        tiposMateria,
        tiposNorma,
        tiposSessao,
        situacoesSessao,
        tiposAutor,
        tematicas,
        statusTramitacao,
        unidadesTramitacao,
        cargosMesa,
        tiposAto,
        classificacoesAto,
      }),
    );
  }
}
