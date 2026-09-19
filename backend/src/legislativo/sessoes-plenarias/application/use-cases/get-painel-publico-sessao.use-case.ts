import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

export type PainelPublicoParlamentar = {
    parliamentarianId: string;
    parlamentarianUserId: string;
    parliamentaryName: string;
    abreviacao: string;
    partidoSigla?: string;
    cargoMesa?: string;
    fotoUrl?: string | null;
    presente: boolean;
    situacao?: 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO';
    origem: 'APP' | 'STAFF' | null;
};

export type PainelPublicoResult = {
    sessao: {
        id: string;
        dataInicio: string;
        dataFim?: string | null;
        nome?: string | null;
        statusSessao: string;
        faseAtual: { value: string; label: string } | null;
        quorumMinimo?: number | null;
        tipo: { id: string; nome: string; label?: string };
        sessaoLegislativa?: {
            id: string;
            numero: number;
            legislatura?: { id: string; numero: number } | null;
        } | null;
        createdAt: string;
        updatedAt: string;
    };
    tenant: {
        name: string;
        logo: string | null;
        city: string | null;
    };
    itens: Array<{
        id: string;
        sessaoId: string;
        categoria?: string;
        materia?: {
            id: string;
            numero?: string | number | null;
            ano?: number | null;
            ementa?: string;
            status?: string;
            tipo?: { id: string; nome: string; sigla?: string | null };
        } | null;
        aviso?: { titulo?: string | null; texto?: string | null } | null;
        fase: string;
        tipoPautaItem: string;
        ordem: number;
        status?: string;
        resultado?: string | null;
        votacao?: {
            id: string;
            tipoVotacao?: string;
            resultado?: string | null;
            finalizada?: boolean;
            votosSim?: number;
            votosNao?: number;
            abstencoes?: number;
            parliamentarianIdsQueVotaram?: string[];
        } | null;
    }>;
    presenca: {
        sessaoId: string;
        totalMembros: number;
        presentes: number;
        ausentes: number;
        quorumMinimo: number;
        temQuorum: boolean;
        parlamentares: PainelPublicoParlamentar[];
        mesaMembros: PainelPublicoParlamentar[];
        vereadores: PainelPublicoParlamentar[];
    };
    votacaoAberta: {
        sessaoId: string;
        votacaoId: string;
        pautaItemId: string;
        tipoVotacao: string;
        titulo: string;
        ementa?: string;
        votosSim: number;
        votosNao: number;
        abstencoes: number;
        aceitaVotoIndividual: boolean;
        parliamentarianIdsQueVotaram: string[];
    } | null;
};

function abreviarNome(nome: string): string {
    const parts = nome.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '—';
    if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function faseLabel(fase: string): string {
    const map: Record<string, string> = {
        NAO_INICIADA: 'Não iniciada',
        EXPEDIENTE: 'Expediente',
        ORDEM_DO_DIA: 'Ordem do Dia',
        EXPLICACOES_PESSOAIS: 'Explicações Pessoais',
        ENCERRADA: 'Encerrada',
    };
    return map[fase] ?? fase;
}

/**
 * Snapshot público do telão/painel LED. Sem JWT — busca só por UUID.
 * Não inclui CPF, justificativa de falta nem opção individual de voto.
 */
@Injectable()
export class GetPainelPublicoSessaoUseCase {
    constructor(private readonly prisma: PrismaService) {}

    async execute(sessaoId: string): Promise<PainelPublicoResult> {
        const sessao = await this.prisma.sessaoPlenaria.findFirst({
            where: { id: sessaoId, isRemoved: false },
            include: {
                tipoSessao: { select: { id: true, nome: true } },
                tenant: {
                    select: {
                        name: true,
                        tradeName: true,
                        logo: true,
                        city: true,
                    },
                },
                sessaoLegislativa: {
                    select: {
                        id: true,
                        numero: true,
                        legislatura: { select: { id: true, numero: true } },
                    },
                },
                presencas: {
                    select: {
                        id: true,
                        parliamentarianId: true,
                        presente: true,
                        situacao: true,
                        autoRegistrado: true,
                    },
                },
                pautaItens: {
                    where: { isRemoved: false },
                    orderBy: { ordem: 'asc' },
                    include: {
                        materia: {
                            select: {
                                id: true,
                                numero: true,
                                ementa: true,
                                status: true,
                                ano: { select: { valor: true } },
                                tipo: { select: { id: true, nome: true, sigla: true } },
                            },
                        },
                        votacao: {
                            include: {
                                votos: {
                                    select: { parliamentarianId: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!sessao) {
            throw new NotFoundException('Sessão não encontrada');
        }

        const tenantId = sessao.tenantId;
        const legislaturaNumero = sessao.sessaoLegislativa?.legislatura?.numero;

        let legislatureId: string | undefined;
        if (legislaturaNumero != null) {
            const leg = await this.prisma.legislature.findFirst({
                where: {
                    tenantId,
                    number: legislaturaNumero,
                    isRemoved: false,
                },
                select: { id: true },
            });
            legislatureId = leg?.id;
        }

        const boardWhere = {
            tenantId,
            status: 'ACTIVE' as const,
            isRemoved: false,
            ...(legislaturaNumero != null
                ? { legislature: { number: legislaturaNumero, isRemoved: false } }
                : {}),
        };

        const parliamentarianSelect = {
            id: true,
            parliamentaryName: true,
            photoUrl: true,
            status: true,
            parliamentarianUser: {
                select: {
                    politicalParty: { select: { acronym: true, name: true } },
                },
            },
        } as const;

        const [activeMandates, board] = await Promise.all([
            this.prisma.parliamentarianMandate.findMany({
                where: {
                    tenantId,
                    isRemoved: false,
                    status: 'ACTIVE',
                    ...(legislatureId ? { legislatureId } : {}),
                    parliamentarian: {
                        status: 'ACTIVE',
                        isRemoved: false,
                    },
                },
                select: {
                    parliamentarian: { select: parliamentarianSelect },
                },
                orderBy: {
                    parliamentarian: { parliamentaryName: 'asc' },
                },
            }),
            this.prisma.board.findFirst({
                where: boardWhere,
                include: {
                    members: {
                        include: {
                            boardRole: { select: { name: true } },
                            parliamentarian: {
                                select: parliamentarianSelect,
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        /** Só parlamentares ativos (status + mandato ACTIVE na legislatura). */
        let parlamentares = activeMandates.map((m) => m.parliamentarian);
        if (parlamentares.length === 0) {
            parlamentares = await this.prisma.parliamentarian.findMany({
                where: { tenantId, status: 'ACTIVE', isRemoved: false },
                select: parliamentarianSelect,
                orderBy: { parliamentaryName: 'asc' },
            });
        }
        const activeIds = new Set(parlamentares.map((p) => p.id));

        const presencaPorId = new Map(
            sessao.presencas
                .filter((p) => p.parliamentarianId)
                .map((p) => [p.parliamentarianId!, p]),
        );

        const toElenco = (
            id: string,
            name: string,
            partido?: string | null,
            cargoMesa?: string,
            fotoUrl?: string | null,
        ): PainelPublicoParlamentar => {
            const reg = presencaPorId.get(id);
            const situacao =
                reg?.situacao === 'PRESENTE' ||
                reg?.situacao === 'AUSENTE' ||
                reg?.situacao === 'JUSTIFICADO'
                    ? reg.situacao
                    : undefined;
            const presente = Boolean(reg?.presente && situacao === 'PRESENTE');
            return {
                parliamentarianId: id,
                parlamentarianUserId: id,
                parliamentaryName: name,
                abreviacao: abreviarNome(name),
                partidoSigla: partido ?? undefined,
                cargoMesa,
                fotoUrl: fotoUrl ?? null,
                presente,
                situacao,
                origem: presente ? (reg?.autoRegistrado ? 'APP' : 'STAFF') : null,
            };
        };

        const mesaMembros = (board?.members ?? [])
            .filter(
                (m) =>
                    activeIds.has(m.parliamentarian.id) &&
                    m.parliamentarian.status === 'ACTIVE',
            )
            .map((m) => {
                const party =
                    m.parliamentarian.parliamentarianUser?.politicalParty
                        ?.acronym ??
                    m.parliamentarian.parliamentarianUser?.politicalParty?.name;
                return toElenco(
                    m.parliamentarian.id,
                    m.parliamentarian.parliamentaryName,
                    party,
                    m.boardRole.name,
                    m.parliamentarian.photoUrl,
                );
            });

        const mesaIds = new Set(mesaMembros.map((m) => m.parliamentarianId));
        const elencoAll = parlamentares.map((p) => {
            const party =
                p.parliamentarianUser?.politicalParty?.acronym ??
                p.parliamentarianUser?.politicalParty?.name;
            const mesa = mesaMembros.find((m) => m.parliamentarianId === p.id);
            return toElenco(
                p.id,
                p.parliamentaryName,
                party,
                mesa?.cargoMesa,
                p.photoUrl,
            );
        });

        const presentes = elencoAll.filter((p) => p.presente).length;
        const totalMembros = elencoAll.length;
        const quorumMinimo =
            sessao.quorumMinimo ?? Math.floor(totalMembros / 2) + 1;

        const itens = sessao.pautaItens.map((item) => {
            const votacao = item.votacao;
            const finalizada = Boolean(votacao?.resultado || votacao?.encerradaAt);
            const idsQueVotaram = (votacao?.votos ?? [])
                .map((v) => v.parliamentarianId)
                .filter((id): id is string => Boolean(id));

            return {
                id: item.id,
                sessaoId: sessao.id,
                categoria: item.categoria ?? undefined,
                materia: item.materia
                    ? {
                          id: item.materia.id,
                          numero: item.materia.numero,
                          ano: item.materia.ano?.valor ?? null,
                          ementa: item.materia.ementa,
                          status: item.materia.status,
                          tipo: item.materia.tipo
                              ? {
                                    id: item.materia.tipo.id,
                                    nome: item.materia.tipo.nome,
                                    sigla: item.materia.tipo.sigla,
                                }
                              : undefined,
                      }
                    : null,
                aviso:
                    item.categoria === 'AVISO'
                        ? { titulo: item.avisoTitulo, texto: item.avisoTexto }
                        : null,
                fase: item.fase,
                tipoPautaItem: item.tipoPautaItem,
                ordem: item.ordem,
                status: item.statusPauta,
                resultado: item.resultado,
                votacao: votacao
                    ? {
                          id: votacao.id,
                          tipoVotacao: votacao.tipoVotacao,
                          resultado: votacao.resultado,
                          finalizada,
                          votosSim: votacao.votosSim ?? 0,
                          votosNao: votacao.votosNao ?? 0,
                          abstencoes: votacao.abstencoes ?? 0,
                          // IDs sem opção — seguro também em votação secreta ("já votou").
                          parliamentarianIdsQueVotaram: idsQueVotaram,
                      }
                    : null,
            };
        });

        const itemAberto = itens.find((i) => i.votacao && !i.votacao.finalizada);
        let votacaoAberta: PainelPublicoResult['votacaoAberta'] = null;
        if (itemAberto?.votacao) {
            const tipo = itemAberto.votacao.tipoVotacao ?? 'NOMINAL';
            const tituloParts = [
                itemAberto.materia?.tipo?.sigla ?? itemAberto.materia?.tipo?.nome,
                itemAberto.materia?.numero != null
                    ? `nº ${itemAberto.materia.numero}`
                    : null,
            ].filter(Boolean);
            votacaoAberta = {
                sessaoId: sessao.id,
                votacaoId: itemAberto.votacao.id,
                pautaItemId: itemAberto.id,
                tipoVotacao: tipo,
                titulo: tituloParts.join(' ') || 'Votação em andamento',
                ementa: itemAberto.materia?.ementa,
                votosSim: itemAberto.votacao.votosSim ?? 0,
                votosNao: itemAberto.votacao.votosNao ?? 0,
                abstencoes: itemAberto.votacao.abstencoes ?? 0,
                aceitaVotoIndividual: tipo === 'NOMINAL',
                parliamentarianIdsQueVotaram:
                    itemAberto.votacao.parliamentarianIdsQueVotaram ?? [],
            };
        }

        const displayName =
            sessao.tenant.tradeName?.trim() || sessao.tenant.name;

        return {
            sessao: {
                id: sessao.id,
                dataInicio: sessao.dataInicio.toISOString(),
                dataFim: sessao.dataFim?.toISOString() ?? null,
                // `nome` pode não existir no client Prisma gerado; evita acoplamento.
                nome: (sessao as { nome?: string | null }).nome ?? null,
                statusSessao: sessao.statusSessao,
                faseAtual: {
                    value: sessao.faseAtual,
                    label: faseLabel(sessao.faseAtual),
                },
                quorumMinimo: sessao.quorumMinimo,
                tipo: {
                    id: sessao.tipoSessao.id,
                    nome: sessao.tipoSessao.nome,
                    label: sessao.tipoSessao.nome,
                },
                sessaoLegislativa: sessao.sessaoLegislativa
                    ? {
                          id: sessao.sessaoLegislativa.id,
                          numero: sessao.sessaoLegislativa.numero,
                          legislatura: sessao.sessaoLegislativa.legislatura,
                      }
                    : null,
                createdAt: sessao.createdAt.toISOString(),
                updatedAt: sessao.updatedAt.toISOString(),
            },
            tenant: {
                name: displayName,
                logo: sessao.tenant.logo,
                city: sessao.tenant.city,
            },
            itens,
            presenca: {
                sessaoId: sessao.id,
                totalMembros,
                presentes,
                ausentes: totalMembros - presentes,
                quorumMinimo,
                temQuorum: presentes >= quorumMinimo,
                parlamentares: elencoAll,
                mesaMembros,
                vereadores: elencoAll.filter((p) => !mesaIds.has(p.parliamentarianId)),
            },
            votacaoAberta,
        };
    }
}
