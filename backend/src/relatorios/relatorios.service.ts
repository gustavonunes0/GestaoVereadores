import { Injectable } from '@nestjs/common';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

/** Filtros equivalentes a RELATORIOS_ATIVIDADELEGISLATIVACOMPLETO */
export class RelatorioAtividadeCompletoDto {
  @IsString()
  legislaturaId: string;

  @IsString()
  sessaoLegislativaId: string;

  @IsOptional()
  @IsDateString()
  dataInicioDe?: string;

  @IsOptional()
  @IsDateString()
  dataInicioAte?: string;
}

/** Filtros equivalentes a RELATORIOS_ATIVIDADELEGISLATIVAGERAL */
export class RelatorioAtividadeGeralDto {
  @IsString()
  legislaturaId: string;

  @IsOptional()
  @IsDateString()
  dataApresentacaoDe?: string;

  @IsOptional()
  @IsDateString()
  dataApresentacaoAte?: string;

  @IsOptional()
  @IsString()
  tipoAutorId?: string;

  @IsOptional()
  @IsString()
  autorId?: string;
}

/** Filtros equivalentes a RELATORIOS_PRESENCAANALITICA / PRESENCAGERAL */
export class RelatorioPresencaDto {
  @IsString()
  legislaturaId: string;

  @IsString()
  sessaoLegislativaId: string;

  @IsOptional()
  @IsString()
  tipoSessaoId?: string;

  @IsOptional()
  @IsString()
  sessaoPlenariaId?: string;

  @IsOptional()
  @IsDateString()
  dataInicioDe?: string;

  @IsOptional()
  @IsDateString()
  dataInicioAte?: string;
}

@Injectable()
export class RelatoriosService {
  constructor(private readonly prisma: PrismaService) {}

  async atividadeCompleto(dto: RelatorioAtividadeCompletoDto) {
    const materias = await this.prisma.materia.findMany({
      where: {
        pautaItens: {
          some: {
            sessao: {
              sessaoLegislativaId: dto.sessaoLegislativaId,
              sessaoLegislativa: { legislaturaId: dto.legislaturaId },
              ...(dto.dataInicioDe || dto.dataInicioAte
                ? {
                    dataInicio: {
                      ...(dto.dataInicioDe && { gte: new Date(dto.dataInicioDe) }),
                      ...(dto.dataInicioAte && { lte: new Date(dto.dataInicioAte) }),
                    },
                  }
                : {}),
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

  async atividadeGeral(dto: RelatorioAtividadeGeralDto) {
    const materias = await this.prisma.materia.findMany({
      where: {
        ...(dto.autorId && { autorId: dto.autorId }),
        ...(dto.dataApresentacaoDe || dto.dataApresentacaoAte
          ? {
              dataApresentacaoInicio: {
                ...(dto.dataApresentacaoDe && {
                  gte: new Date(dto.dataApresentacaoDe),
                }),
                ...(dto.dataApresentacaoAte && {
                  lte: new Date(dto.dataApresentacaoAte),
                }),
              },
            }
          : {}),
      },
      include: { tipo: true, autor: { include: { tipoAutor: true } } },
    });
    return { filtros: dto, total: materias.length, materias };
  }

  async presenca(dto: RelatorioPresencaDto) {
    const sessoes = await this.prisma.sessaoPlenaria.findMany({
      where: {
        sessaoLegislativaId: dto.sessaoLegislativaId,
        sessaoLegislativa: { legislaturaId: dto.legislaturaId },
        ...(dto.tipoSessaoId && { tipoSessaoId: dto.tipoSessaoId }),
        ...(dto.sessaoPlenariaId && { id: dto.sessaoPlenariaId }),
        ...(dto.dataInicioDe || dto.dataInicioAte
          ? {
              dataInicio: {
                ...(dto.dataInicioDe && { gte: new Date(dto.dataInicioDe) }),
                ...(dto.dataInicioAte && { lte: new Date(dto.dataInicioAte) }),
              },
            }
          : {}),
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
