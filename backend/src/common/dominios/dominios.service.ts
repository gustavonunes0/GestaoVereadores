import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DominiosService {
    constructor(private readonly prisma: PrismaService) {}

    async listForTenant(tenantId: string) {
        const mapNome = (rows: { id: string; nome: string }[]) =>
            rows.map((r) => ({ id: r.id, nome: r.nome }));

        const [
            anos,
            tiposMateria,
            tiposListagem,
            tematicas,
            origensMateria,
            locaisOrigemExterna,
            tiposAutor,
            statusTramitacao,
            unidadesTramitacao,
            tiposSessao,
            situacoesSessao,
            tiposNorma,
            esferasFederacao,
            identificadoresNorma,
            tiposAto,
            classificacoesAto,
            cargosMesa,
            tiposComissao,
        ] = await Promise.all([
            this.prisma.ano.findMany({
                orderBy: { valor: 'desc' },
                select: { id: true, valor: true },
            }),
            this.prisma.tipoMateria.findMany({
                where: { tenantId },
                orderBy: { nome: 'asc' },
                select: { id: true, nome: true },
            }),
            this.prisma.tipoListagem.findMany({
                orderBy: { nome: 'asc' },
                select: { id: true, nome: true },
            }),
            this.prisma.tematica.findMany({
                orderBy: { nome: 'asc' },
                select: { id: true, nome: true },
            }),
            this.prisma.origemMateria.findMany({
                orderBy: { nome: 'asc' },
                select: { id: true, nome: true },
            }),
            this.prisma.localOrigemExterna.findMany({
                orderBy: { nome: 'asc' },
                select: { id: true, nome: true },
            }),
            this.prisma.tipoAutor.findMany({
                where: { tenantId },
                orderBy: { nome: 'asc' },
                select: { id: true, nome: true },
            }),
            this.prisma.statusTramitacao.findMany({
                orderBy: { nome: 'asc' },
                select: { id: true, nome: true },
            }),
            this.prisma.unidadeTramitacao.findMany({
                orderBy: { nome: 'asc' },
                select: { id: true, nome: true },
            }),
            this.prisma.tipoSessao.findMany({
                where: { tenantId },
                orderBy: { nome: 'asc' },
                select: { id: true, nome: true, codigo: true },
            }),
            this.prisma.situacaoSessao.findMany({
                orderBy: { nome: 'asc' },
                select: { id: true, nome: true, codigo: true },
            }),
            this.prisma.tipoNorma.findMany({
                orderBy: { nome: 'asc' },
                select: { id: true, nome: true },
            }),
            this.prisma.esferaFederacao.findMany({
                orderBy: { nome: 'asc' },
                select: { id: true, nome: true },
            }),
            this.prisma.identificadorNorma.findMany({
                orderBy: { nome: 'asc' },
                select: { id: true, nome: true },
            }),
            this.prisma.tipoAto.findMany({
                orderBy: { nome: 'asc' },
                select: { id: true, nome: true },
            }),
            this.prisma.classificacaoAto.findMany({
                orderBy: { nome: 'asc' },
                select: { id: true, nome: true },
            }),
            this.prisma.cargoMesa.findMany({
                where: { tenantId },
                orderBy: { nome: 'asc' },
                select: { id: true, nome: true },
            }),
            this.prisma.tipoComissao.findMany({
                where: { tenantId },
                orderBy: { nome: 'asc' },
                select: { id: true, nome: true },
            }),
        ]);

        return {
            anos: anos.map((a) => ({ id: a.id, valor: a.valor })),
            tiposMateria: mapNome(tiposMateria),
            tiposListagem: mapNome(tiposListagem),
            tematicas: mapNome(tematicas),
            origensMateria: mapNome(origensMateria),
            locaisOrigemExterna: mapNome(locaisOrigemExterna),
            tiposAutor: mapNome(tiposAutor),
            statusTramitacao: mapNome(statusTramitacao),
            unidadesTramitacao: mapNome(unidadesTramitacao),
            tiposSessao: tiposSessao.map((t) => ({
                id: t.id,
                nome: t.nome,
                ...(t.codigo ? { codigo: t.codigo } : {}),
            })),
            situacoesSessao: situacoesSessao.map((s) => ({
                id: s.id,
                nome: s.nome,
                ...(s.codigo ? { codigo: s.codigo } : {}),
            })),
            tiposNorma: mapNome(tiposNorma),
            esferasFederacao: mapNome(esferasFederacao),
            identificadoresNorma: mapNome(identificadoresNorma),
            tiposAto: mapNome(tiposAto),
            classificacoesAto: mapNome(classificacoesAto),
            cargosMesa: mapNome(cargosMesa),
            tiposComissao: mapNome(tiposComissao),
        };
    }
}
