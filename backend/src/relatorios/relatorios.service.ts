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

    async atividadeCompleto(
        tenantId: string,
        dto: RelatorioAtividadeCompletoDto,
    ) {
        const range = buildDateRangeFilter(dto.dataInicioDe, dto.dataInicioAte);
        const materias = await this.prisma.materia.findMany({
            where: {
                ...tenantWhere(tenantId),
                pautaItens: {
                    some: {
                        sessao: {
                            sessaoLegislativaId: dto.sessaoLegislativaId,
                            sessaoLegislativa: {
                                legislaturaId: dto.legislaturaId,
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
        const legislatura = await this.prisma.legislatura.findFirst({
            where: { id: dto.legislaturaId, ...tenantWhere(tenantId) },
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
                                            legislaturaId: dto.legislaturaId,
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
        const range = buildDateRangeFilter(dto.dataInicioDe, dto.dataInicioAte);
        const sessoes = await this.prisma.sessaoPlenaria.findMany({
            where: {
                ...tenantWhere(tenantId),
                sessaoLegislativaId: dto.sessaoLegislativaId,
                sessaoLegislativa: { legislaturaId: dto.legislaturaId },
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
