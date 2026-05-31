import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  ResultadoPauta,
  ResultadoVotacao,
  SituacaoPresenca,
  TipoVotacao,
} from '@prisma/client';
import { buildDateRangeFilter } from '../common/prisma/date-fields';
import { paginatedQuery } from '../common/prisma/paginate';
import { tenantWhere } from '../common/prisma/tenant-scope';
import { sessaoPlenariaInclude } from '../common/prisma/prisma-includes';
import { PrismaService } from '../prisma/prisma.service';
import {
  assertMateriaPodeEntrarNaPauta,
  mapResultadoPautaParaStatus,
  mapResultadoVotacaoParaStatus,
} from '../materias/domain/materia-workflow';
import { votacaoInclude } from '../common/prisma/prisma-includes';
import {
  AddPautaItemDto,
  CreateSessaoPlenariaDto,
  FilterSessaoPlenariaDto,
  RegistrarPresencaDto,
  RegistrarResultadoPautaDto,
} from './dto/sessao.dto';
import { UpdateSessaoPlenariaDto } from './dto/update-sessao.dto';
import {
  assertSessaoAceitaPauta,
  assertSessaoNaoEncerrada,
} from './domain/sessao-workflow';
import {
  AbrirVotacaoDto,
  FinalizarVotacaoDto,
  RegistrarVotoDto,
} from './dto/votacao.dto';
import {
  assertQuorumAtingido,
  assertTipoAceitaVotoIndividual,
  assertVotacaoAberta,
  calcularResultadoVotacao,
  contarVotos,
  mapResultadoVotacaoParaPauta,
} from './domain/votacao-workflow';

@Injectable()
export class SessoesService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, dto: CreateSessaoPlenariaDto) {
    return this.prisma.sessaoPlenaria.create({
      data: {
        tenantId,
        dataInicio: new Date(dto.dataInicio),
        tipoSessaoId: dto.tipoSessaoId,
        situacaoId: dto.situacaoId,
        sessaoLegislativaId: dto.sessaoLegislativaId,
        mensagem: dto.mensagem,
      },
      include: sessaoPlenariaInclude,
    });
  }

  findAll(tenantId: string, filters: FilterSessaoPlenariaDto) {
    const where: Prisma.SessaoPlenariaWhereInput = { ...tenantWhere(tenantId) };
    if (filters.tipoSessaoId) where.tipoSessaoId = filters.tipoSessaoId;
    if (filters.situacaoId) where.situacaoId = filters.situacaoId;
    if (filters.sessaoLegislativaId) {
      where.sessaoLegislativaId = filters.sessaoLegislativaId;
    }
    if (filters.legislaturaId) {
      where.sessaoLegislativa = { legislaturaId: filters.legislaturaId };
    }
    const range = buildDateRangeFilter(
      filters.dataInicioDe,
      filters.dataInicioAte,
    );
    if (range) where.dataInicio = range;

    return paginatedQuery(
      () => this.prisma.sessaoPlenaria.count({ where }),
      (skip, take) =>
        this.prisma.sessaoPlenaria.findMany({
          where,
          include: sessaoPlenariaInclude,
          orderBy: { dataInicio: 'desc' },
          skip,
          take,
        }),
      filters,
    );
  }

  async findOne(tenantId: string, id: string) {
    const item = await this.prisma.sessaoPlenaria.findFirst({
      where: { id, ...tenantWhere(tenantId) },
      include: sessaoPlenariaInclude,
    });
    if (!item) throw new NotFoundException('Sessão plenária não encontrada');
    return item;
  }

  async update(tenantId: string, id: string, dto: UpdateSessaoPlenariaDto) {
    const sessao = await this.findOne(tenantId, id);
    if (dto.situacaoId) {
      const novaSituacao = await this.prisma.situacaoSessao.findUnique({
        where: { id: dto.situacaoId },
      });
      if (novaSituacao) {
        assertSessaoNaoEncerrada(sessao.situacao);
      }
    }

    return this.prisma.sessaoPlenaria.update({
      where: { id },
      data: {
        dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
        tipoSessaoId: dto.tipoSessaoId,
        situacaoId: dto.situacaoId,
        sessaoLegislativaId: dto.sessaoLegislativaId,
        mensagem: dto.mensagem,
      },
      include: sessaoPlenariaInclude,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.sessaoPlenaria.update({
      where: { id },
      data: { isRemoved: true },
    });
  }

  async addPautaItem(tenantId: string, sessaoId: string, dto: AddPautaItemDto) {
    const sessao = await this.prisma.sessaoPlenaria.findFirst({
      where: { id: sessaoId, ...tenantWhere(tenantId) },
      include: { situacao: true },
    });
    if (!sessao) throw new NotFoundException('Sessão plenária não encontrada');

    assertSessaoAceitaPauta(sessao.situacao);

    const materia = await this.prisma.materia.findFirst({
      where: { id: dto.materiaId, ...tenantWhere(tenantId) },
    });
    if (!materia) throw new NotFoundException('Matéria não encontrada');

    assertMateriaPodeEntrarNaPauta(materia);

    const jaNaPauta = await this.prisma.pautaItem.findFirst({
      where: {
        sessaoId,
        materiaId: dto.materiaId,
        isRemoved: false,
      },
    });
    if (jaNaPauta) {
      throw new ConflictException('Matéria já consta na pauta desta sessão');
    }

    const ordemOcupada = await this.prisma.pautaItem.findFirst({
      where: { sessaoId, ordem: dto.ordem, isRemoved: false },
    });
    if (ordemOcupada) {
      throw new ConflictException(
        `Ordem ${dto.ordem} já está em uso na pauta desta sessão`,
      );
    }

    return this.prisma.pautaItem.create({
      data: {
        sessaoId,
        materiaId: dto.materiaId,
        ordem: dto.ordem,
        fase: dto.fase,
      },
      include: { materia: true },
    });
  }

  async removerPautaItem(
    tenantId: string,
    sessaoId: string,
    pautaItemId: string,
  ) {
    const sessao = await this.findOne(tenantId, sessaoId);
    assertSessaoAceitaPauta(sessao.situacao);

    const item = await this.prisma.pautaItem.findFirst({
      where: { id: pautaItemId, sessaoId, isRemoved: false },
    });
    if (!item) throw new NotFoundException('Item de pauta não encontrado');

    return this.prisma.pautaItem.update({
      where: { id: pautaItemId },
      data: { isRemoved: true },
    });
  }

  async registrarResultadoPauta(
    tenantId: string,
    sessaoId: string,
    pautaItemId: string,
    dto: RegistrarResultadoPautaDto,
  ) {
    const sessao = await this.prisma.sessaoPlenaria.findFirst({
      where: { id: sessaoId, ...tenantWhere(tenantId) },
      include: { situacao: true },
    });
    if (!sessao) throw new NotFoundException('Sessão plenária não encontrada');

    assertSessaoAceitaPauta(sessao.situacao);

    if (
      dto.resultado !== ResultadoPauta.APROVADO &&
      dto.resultado !== ResultadoPauta.REJEITADO
    ) {
      throw new BadRequestException(
        'Para atualizar o status da matéria use resultado APROVADO ou REJEITADO',
      );
    }

    const pautaItem = await this.prisma.pautaItem.findFirst({
      where: { id: pautaItemId, sessaoId, isRemoved: false },
      include: { materia: true },
    });
    if (!pautaItem) throw new NotFoundException('Item de pauta não encontrado');

    if (pautaItem.materia.tenantId !== tenantId) {
      throw new NotFoundException('Matéria não encontrada');
    }

    const novoStatus = mapResultadoPautaParaStatus(dto.resultado);

    await this.prisma.materia.update({
      where: { id: pautaItem.materiaId },
      data: {
        status: novoStatus,
        emTramitacao: false,
      },
    });

    return this.prisma.pautaItem.update({
      where: { id: pautaItemId },
      data: { resultado: dto.resultado },
      include: { materia: true },
    });
  }

  private resolvePresencaCampos(dto: RegistrarPresencaDto) {
    if (dto.situacao) {
      const presente = dto.situacao === SituacaoPresenca.PRESENTE;
      return {
        presente,
        situacao: dto.situacao,
        justificativa: dto.justificativa,
      };
    }
    const presente = dto.presente ?? true;
    return {
      presente,
      situacao: presente
        ? SituacaoPresenca.PRESENTE
        : SituacaoPresenca.AUSENTE,
      justificativa: dto.justificativa,
    };
  }

  private async assertQuorumSessao(
    tenantId: string,
    sessaoId: string,
    requerQuorum: boolean,
  ) {
    const [presentes, totalParlamentares] = await Promise.all([
      this.prisma.presencaSessao.count({
        where: {
          sessaoId,
          OR: [
            { presente: true },
            { situacao: SituacaoPresenca.PRESENTE },
          ],
        },
      }),
      this.prisma.parlamentar.count({
        where: { ...tenantWhere(tenantId), ativo: true },
      }),
    ]);
    assertQuorumAtingido(presentes, totalParlamentares, requerQuorum);
  }

  private sanitizeVotacao<T extends { tipoVotacao: TipoVotacao; votos?: unknown[] }>(
    votacao: T,
  ): Omit<T, 'votos'> & { votos?: unknown[] } {
    if (votacao.tipoVotacao === TipoVotacao.SECRETA) {
      const { votos: _v, ...rest } = votacao;
      return rest;
    }
    return votacao;
  }

  private async getPautaItemVotacao(
    tenantId: string,
    sessaoId: string,
    pautaItemId: string,
  ) {
    const sessao = await this.prisma.sessaoPlenaria.findFirst({
      where: { id: sessaoId, ...tenantWhere(tenantId) },
      include: { situacao: true, tipoSessao: true },
    });
    if (!sessao) throw new NotFoundException('Sessão plenária não encontrada');

    assertSessaoAceitaPauta(sessao.situacao);

    const pautaItem = await this.prisma.pautaItem.findFirst({
      where: { id: pautaItemId, sessaoId, isRemoved: false },
      include: {
        materia: true,
        votacao: votacaoInclude,
      },
    });
    if (!pautaItem) throw new NotFoundException('Item de pauta não encontrado');
    if (pautaItem.materia.tenantId !== tenantId) {
      throw new NotFoundException('Matéria não encontrada');
    }

    return { sessao, pautaItem };
  }

  async abrirVotacao(
    tenantId: string,
    sessaoId: string,
    pautaItemId: string,
    dto: AbrirVotacaoDto,
  ) {
    const { sessao, pautaItem } = await this.getPautaItemVotacao(
      tenantId,
      sessaoId,
      pautaItemId,
    );

    if (pautaItem.votacao) {
      throw new ConflictException('Já existe votação aberta para este item de pauta');
    }

    await this.assertQuorumSessao(
      tenantId,
      sessaoId,
      sessao.tipoSessao.requerQuorum,
    );

    const votacao = await this.prisma.votacao.create({
      data: {
        pautaItemId,
        tipoVotacao: dto.tipoVotacao,
      },
      include: votacaoInclude.include,
    });

    return this.sanitizeVotacao(votacao);
  }

  async obterVotacao(
    tenantId: string,
    sessaoId: string,
    pautaItemId: string,
  ) {
    const { pautaItem } = await this.getPautaItemVotacao(
      tenantId,
      sessaoId,
      pautaItemId,
    );

    if (!pautaItem.votacao) {
      throw new NotFoundException('Votação não encontrada para este item de pauta');
    }

    return this.sanitizeVotacao(pautaItem.votacao);
  }

  async registrarVoto(
    tenantId: string,
    sessaoId: string,
    pautaItemId: string,
    dto: RegistrarVotoDto,
  ) {
    const { pautaItem } = await this.getPautaItemVotacao(
      tenantId,
      sessaoId,
      pautaItemId,
    );

    if (!pautaItem.votacao) {
      throw new NotFoundException('Votação não encontrada');
    }

    const votacao = pautaItem.votacao;
    assertVotacaoAberta(votacao.realizadaAt);
    assertTipoAceitaVotoIndividual(votacao.tipoVotacao);

    const presenca = await this.prisma.presencaSessao.findUnique({
      where: {
        sessaoId_parlamentarId: {
          sessaoId,
          parlamentarId: dto.parlamentarId,
        },
      },
    });
    const estaPresente =
      presenca &&
      (presenca.presente || presenca.situacao === SituacaoPresenca.PRESENTE);
    if (!estaPresente) {
      throw new BadRequestException(
        'Somente parlamentares presentes podem registrar voto',
      );
    }

    const parlamentar = await this.prisma.parlamentar.findFirst({
      where: { id: dto.parlamentarId, ...tenantWhere(tenantId) },
    });
    if (!parlamentar) {
      throw new NotFoundException('Parlamentar não encontrado');
    }

    const voto = await this.prisma.votoParlamentar.upsert({
      where: {
        votacaoId_parlamentarId: {
          votacaoId: votacao.id,
          parlamentarId: dto.parlamentarId,
        },
      },
      create: {
        votacaoId: votacao.id,
        parlamentarId: dto.parlamentarId,
        voto: dto.voto,
      },
      update: { voto: dto.voto },
    });

    const votos = await this.prisma.votoParlamentar.findMany({
      where: { votacaoId: votacao.id },
      select: { voto: true },
    });
    const totais = contarVotos(votos.map((v) => v.voto));

    await this.prisma.votacao.update({
      where: { id: votacao.id },
      data: totais,
    });

    return { registrado: true, votoId: voto.id };
  }

  async finalizarVotacao(
    tenantId: string,
    sessaoId: string,
    pautaItemId: string,
    dto: FinalizarVotacaoDto,
  ) {
    const { pautaItem } = await this.getPautaItemVotacao(
      tenantId,
      sessaoId,
      pautaItemId,
    );

    if (!pautaItem.votacao) {
      throw new NotFoundException('Votação não encontrada');
    }

    const votacao = pautaItem.votacao;
    assertVotacaoAberta(votacao.realizadaAt);

    let votosSim: number;
    let votosNao: number;
    let abstencoes: number;

    if (votacao.tipoVotacao === TipoVotacao.SIMBOLICA) {
      if (
        dto.votosSim === undefined ||
        dto.votosNao === undefined
      ) {
        throw new BadRequestException(
          'Votação simbólica exige votosSim e votosNao na finalização',
        );
      }
      votosSim = dto.votosSim;
      votosNao = dto.votosNao;
      abstencoes = dto.abstencoes ?? 0;
    } else {
      const votos = await this.prisma.votoParlamentar.findMany({
        where: { votacaoId: votacao.id },
        select: { voto: true },
      });
      const totais = contarVotos(votos.map((v) => v.voto));
      votosSim = totais.votosSim;
      votosNao = totais.votosNao;
      abstencoes = totais.abstencoes;
    }

    const resultado = calcularResultadoVotacao(votosSim, votosNao);
    const resultadoPauta = mapResultadoVotacaoParaPauta(resultado);

    await this.prisma.votacao.update({
      where: { id: votacao.id },
      data: {
        votosSim,
        votosNao,
        abstencoes,
        resultado,
        realizadaAt: new Date(),
      },
    });

    if (
      resultadoPauta === ResultadoPauta.APROVADO ||
      resultadoPauta === ResultadoPauta.REJEITADO
    ) {
      const novoStatus = mapResultadoVotacaoParaStatus(resultadoPauta);
      await this.prisma.materia.update({
        where: { id: pautaItem.materiaId },
        data: {
          status: novoStatus,
          emTramitacao: false,
        },
      });

      await this.prisma.pautaItem.update({
        where: { id: pautaItemId },
        data: { resultado: resultadoPauta },
      });
    }

    const atualizada = await this.prisma.votacao.findUnique({
      where: { id: votacao.id },
      include: votacaoInclude.include,
    });

    return this.sanitizeVotacao(atualizada!);
  }

  async registrarPresenca(
    tenantId: string,
    sessaoId: string,
    dto: RegistrarPresencaDto,
  ) {
    const sessao = await this.findOne(tenantId, sessaoId);
    assertSessaoNaoEncerrada(sessao.situacao);

    const parlamentar = await this.prisma.parlamentar.findFirst({
      where: { id: dto.parlamentarId, ...tenantWhere(tenantId) },
    });
    if (!parlamentar) {
      throw new NotFoundException('Parlamentar não encontrado');
    }

    const campos = this.resolvePresencaCampos(dto);

    return this.prisma.presencaSessao.upsert({
      where: {
        sessaoId_parlamentarId: {
          sessaoId,
          parlamentarId: dto.parlamentarId,
        },
      },
      create: {
        sessaoId,
        parlamentarId: dto.parlamentarId,
        ...campos,
      },
      update: campos,
      include: { parlamentar: { include: { pessoa: true } } },
    });
  }
}
