import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { ATA_REPOSITORY, SESSAO_PLENARIA_REPOSITORY } from '../../../sessoes-plenarias.tokens';
import { SessaoPlenariaRepository } from '../../../domain/repositories/sessao-plenaria.repository';
import { StatusSessao } from '../../../domain/enums/status-sessao.enum';
import { AtaRepository } from '../../domain/repositories/ata.repository';
import { AtaTemplateService } from '../../domain/services/ata-template.service';
import { AtaSessaoNaoEncerradaError, AtaJaExisteError } from '../errors/ata.errors';
import { AtaViewModel } from '../view-models/ata.view-model';
import { SessaoHistoricoRepository } from '../../../../sessao-historico/domain/repositories/sessao-historico.repository';
import { TipoEventoSessaoHistorico } from '../../../../sessao-historico/domain/enums/tipo-evento-sessao-historico.enum';

@Injectable()
export class GerarRascunhoAtaUseCase {
    private readonly templateService = new AtaTemplateService();

    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly sessaoRepository: SessaoPlenariaRepository,
        @Inject(ATA_REPOSITORY)
        private readonly ataRepository: AtaRepository,
        private readonly prisma: PrismaService,
        private readonly historicoRepository: SessaoHistoricoRepository,
    ) {}

    async execute(tenantId: string, sessaoId: string) {
        const sessao = await this.sessaoRepository.findSessaoById(sessaoId, tenantId);
        if (!sessao) throw new NotFoundException('Sessão plenária não encontrada');

        if (sessao.statusSessao !== StatusSessao.ENCERRADA) {
            throw new AtaSessaoNaoEncerradaError();
        }

        const existente = await this.ataRepository.findBySessaoId(sessaoId, tenantId);
        if (existente) throw new AtaJaExisteError();

        const dadosSessao = await this.prisma.sessaoPlenaria.findFirst({
            where: { id: sessaoId, tenantId },
            include: {
                tenant: {
                    select: {
                        name: true,
                        tradeName: true,
                        city: true,
                        state: true,
                        cnpj: true,
                    },
                },
                tipoSessao: { select: { nome: true } },
                sessaoLegislativa: {
                    select: {
                        numero: true,
                        legislatura: { select: { numero: true } },
                    },
                },
                presencas: {
                    include: {
                        parliamentarian: {
                            include: {
                                parliamentarianUser: { include: { politicalParty: true } },
                            },
                        },
                    },
                },
                pautaItens: {
                    where: { isRemoved: false },
                    orderBy: { ordem: 'asc' },
                    include: {
                        materia: { include: { tipo: true, ano: true } },
                        ato: true,
                        norma: true,
                        comissao: true,
                        votacao: {
                            include: {
                                votos: {
                                    include: {
                                        parliamentarian: {
                                            select: { parliamentaryName: true },
                                        },
                                        parlamentar: {
                                            select: {
                                                pessoa: { select: { nome: true } },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                pedidosPalavra: {
                    orderBy: { criadoEm: 'asc' },
                    include: {
                        parliamentarian: { select: { parliamentaryName: true } },
                    },
                },
            },
        });
        if (!dadosSessao) throw new NotFoundException('Sessão plenária não encontrada');

        const board = await this.prisma.board.findFirst({
            where: { tenantId, status: 'ACTIVE', isRemoved: false },
            include: {
                members: {
                    where: { isRemoved: false },
                    include: {
                        parliamentarian: { select: { parliamentaryName: true } },
                        boardRole: { select: { name: true } },
                    },
                },
            },
        });

        const mesaDiretora = (board?.members ?? []).map((m) => ({
            nome: m.parliamentarian.parliamentaryName,
            cargo: m.boardRole.name,
        }));

        const presencas = dadosSessao.presencas.map((p) => {
            const nomeParlamentar = p.parliamentarian?.parliamentaryName ?? 'Parlamentar';
            const partido =
                p.parliamentarian?.parliamentarianUser?.politicalParty?.acronym ?? null;
            return { nome: nomeParlamentar, partido, situacao: p.situacao };
        });

        const pautaItens = dadosSessao.pautaItens.map((item) => {
            let identificacao = `Item ${item.ordem}`;
            let ementa = '';

            if (item.materia) {
                const ano =
                    item.materia.ano && 'valor' in item.materia.ano
                        ? (item.materia.ano as { valor: number }).valor
                        : null;
                const base = `${item.materia.sigla ?? item.materia.tipo?.nome ?? 'Matéria'} nº ${
                    item.materia.numero ?? '—'
                }${ano != null ? `/${ano}` : ''}`;
                identificacao = base;
                ementa = item.materia.ementa ?? '';
            } else if (item.ato) {
                identificacao = `Ato nº ${item.ato.numero ?? '—'}`;
                ementa = item.ato.ementa ?? '';
            } else if (item.norma) {
                identificacao = `Norma nº ${item.norma.numero ?? '—'}`;
                ementa = item.norma.ementa ?? '';
            } else if (item.categoria === 'AVISO') {
                identificacao = item.avisoTitulo?.trim() || `Aviso — item ${item.ordem}`;
                ementa = item.avisoTexto ?? '';
            } else if (item.categoria === 'ATA') {
                identificacao = item.avisoTitulo?.trim() || `Ata — item ${item.ordem}`;
            } else if (item.comissao) {
                identificacao = `Parecer — ${item.comissao.nome}`;
                ementa = item.avisoTexto ?? '';
            }

            const votacao = item.votacao
                ? {
                      tipoVotacao: item.votacao.tipoVotacao,
                      votosSim: item.votacao.votosSim,
                      votosNao: item.votacao.votosNao,
                      abstencoes: item.votacao.abstencoes,
                      resultado: item.votacao.resultado,
                      votoQualidade: item.votacao.votoQualidade,
                      votos:
                          item.votacao.tipoVotacao === 'SECRETA'
                              ? []
                              : item.votacao.votos.map((v) => ({
                                    nome:
                                        v.parliamentarian?.parliamentaryName ??
                                        v.parlamentar?.pessoa?.nome ??
                                        'Parlamentar',
                                    voto: v.voto,
                                })),
                  }
                : null;

            return {
                ordem: item.ordem,
                fase: item.fase,
                categoria: item.categoria,
                identificacao,
                ementa,
                tipoPautaItem: item.tipoPautaItem,
                resultadoPauta: item.resultado,
                votacao,
            };
        });

        const pedidosPalavra = dadosSessao.pedidosPalavra.map((p) => ({
            nome: p.parliamentarian?.parliamentaryName ?? 'Parlamentar',
            tema: p.tema,
            status: p.status,
            duracaoSegundos: p.duracaoSegundos,
        }));

        const conteudo = this.templateService.montar({
            tenant: {
                nome: dadosSessao.tenant.name,
                nomeFantasia: dadosSessao.tenant.tradeName,
                cidade: dadosSessao.tenant.city,
                uf: dadosSessao.tenant.state,
                cnpj: dadosSessao.tenant.cnpj,
            },
            tipoSessaoNome: dadosSessao.tipoSessao?.nome ?? 'Sessão Plenária',
            dataInicio: dadosSessao.dataInicio,
            dataAbertura: dadosSessao.dataAbertura,
            dataEncerramento: dadosSessao.dataEncerramento,
            observacoes: dadosSessao.observacoes,
            legislaturaNumero: dadosSessao.sessaoLegislativa?.legislatura?.numero ?? null,
            sessaoLegislativaNumero: dadosSessao.sessaoLegislativa?.numero ?? null,
            quorumMinimo: dadosSessao.quorumMinimo,
            quorumPresente: dadosSessao.quorumPresente,
            local: null,
            mesaDiretora,
            presencas,
            pautaItens,
            pedidosPalavra,
        });

        const ata = await this.ataRepository.create({
            tenantId,
            sessaoPlenariaId: sessaoId,
            conteudo,
            geradaAutomaticamente: true,
        });

        await this.historicoRepository.registrar({
            sessaoId,
            tipoEvento: TipoEventoSessaoHistorico.ATA_GERADA,
            descricao: 'Rascunho da ata gerado automaticamente',
        });

        return AtaViewModel.toHttp(ata);
    }
}
