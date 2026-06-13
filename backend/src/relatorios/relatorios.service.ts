import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildDateRangeFilter } from '../common/prisma/date-fields';
import { tenantWhere } from '../common/prisma/tenant-scope';
import { PrismaService } from '../prisma/prisma.service';
import {
    RelatorioAtividadeCompletoDto,
    RelatorioAtividadeGeralDto,
    RelatorioPresencaDto,
} from './dto/relatorio.dto';

@Injectable()
export class RelatoriosService {
    constructor(private readonly prisma: PrismaService) {}

    /** Aceita ID da tabela `legislatures` (API nova) ou `Legislatura` (legado). */
    private async resolveLegislaturaId(
        tenantId: string,
        legislaturaId: string,
    ): Promise<string> {
        const legacy = await this.prisma.legislatura.findFirst({
            where: { id: legislaturaId, ...tenantWhere(tenantId) },
            select: { id: true },
        });
        if (legacy) return legacy.id;

        const legislature = await this.prisma.legislature.findFirst({
            where: { id: legislaturaId, tenantId, isRemoved: false },
            select: { number: true },
        });
        if (!legislature) return legislaturaId;

        const matched = await this.prisma.legislatura.findFirst({
            where: { tenantId, numero: legislature.number },
            select: { id: true },
        });
        return matched?.id ?? legislaturaId;
    }

    async atividadeCompleto(
        tenantId: string,
        dto: RelatorioAtividadeCompletoDto,
    ) {
        const legislaturaId = await this.resolveLegislaturaId(
            tenantId,
            dto.legislaturaId,
        );
        const range = buildDateRangeFilter(dto.dataInicioDe, dto.dataInicioAte);
        const materias = await this.prisma.materia.findMany({
            where: {
                ...tenantWhere(tenantId),
                pautaItens: {
                    some: {
                        sessao: {
                            sessaoLegislativaId: dto.sessaoLegislativaId,
                            sessaoLegislativa: {
                                legislaturaId,
                            },
                            ...(range && { dataInicio: range }),
                        },
                    },
                },
            },
            include: {
                tipo: true,
                autor: true,
                statusTramitacao: true,
                pautaItens: { include: { sessao: true } },
            },
        });
        return {
            filtros: dto,
            total: materias.length,
            materias,
        };
    }

    async atividadeGeral(tenantId: string, dto: RelatorioAtividadeGeralDto) {
        const legislaturaId = await this.resolveLegislaturaId(
            tenantId,
            dto.legislaturaId,
        );
        const legislatura = await this.prisma.legislatura.findFirst({
            where: { id: legislaturaId, ...tenantWhere(tenantId) },
        });

        const apresentacaoRange = buildDateRangeFilter(
            dto.dataApresentacaoDe,
            dto.dataApresentacaoAte,
        );

        const where: Prisma.MateriaWhereInput = {
            ...tenantWhere(tenantId),
            ...(dto.autorId && { autorId: dto.autorId }),
            ...(dto.tipoAutorId && { autor: { tipoAutorId: dto.tipoAutorId } }),
            ...(apresentacaoRange && {
                dataApresentacaoInicio: apresentacaoRange,
            }),
        };

        if (legislatura) {
            where.AND = [
                {
                    OR: [
                        {
                            pautaItens: {
                                some: {
                                    sessao: {
                                        sessaoLegislativa: {
                                            legislaturaId,
                                        },
                                    },
                                },
                            },
                        },
                        {
                            dataApresentacaoInicio: {
                                gte: legislatura.dataInicio,
                                ...(legislatura.dataFim && {
                                    lte: legislatura.dataFim,
                                }),
                            },
                        },
                    ],
                },
            ];
        }

        const materias = await this.prisma.materia.findMany({
            where,
            include: { tipo: true, autor: { include: { tipoAutor: true } } },
        });
        return { filtros: dto, total: materias.length, materias };
    }

    async presenca(tenantId: string, dto: RelatorioPresencaDto) {
        const legislaturaId = await this.resolveLegislaturaId(
            tenantId,
            dto.legislaturaId,
        );
        const range = buildDateRangeFilter(dto.dataInicioDe, dto.dataInicioAte);
        const sessoes = await this.prisma.sessaoPlenaria.findMany({
            where: {
                ...tenantWhere(tenantId),
                sessaoLegislativaId: dto.sessaoLegislativaId,
                sessaoLegislativa: { legislaturaId },
                ...(dto.tipoSessaoId && { tipoSessaoId: dto.tipoSessaoId }),
                ...(dto.sessaoPlenariaId && { id: dto.sessaoPlenariaId }),
                ...(range && { dataInicio: range }),
            },
            include: {
                presencas: {
                    include: { parlamentar: { include: { pessoa: true } } },
                },
                tipoSessao: true,
            },
        });

        const totalPresentes = sessoes.reduce(
            (acc, s) => acc + s.presencas.filter((p) => p.presente).length,
            0,
        );

        return {
            filtros: dto,
            totalSessoes: sessoes.length,
            totalRegistrosPresenca: totalPresentes,
            sessoes,
        };
    }
}
