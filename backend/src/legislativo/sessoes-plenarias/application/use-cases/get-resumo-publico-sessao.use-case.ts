import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

export type ResumoPublicoDados = {
    sessaoTitulo: string;
    dataAbertura: Date | null;
    dataEncerramento: Date | null;
    mesaDiretora: { nome: string; cargo: string }[];
    presencas: { nome: string; partido?: string | null; situacao: string }[];
    materias: { identificacao: string; ementa: string; resultado?: string | null }[];
};

/**
 * Dados do resumo público de uma sessão encerrada. Rota pública (sem JWT) — por isso a
 * busca é só por `id` (UUID, não enumerável), sem filtro de tenant, seguindo o mesmo padrão
 * já usado por `agenda-legislativa/public` e `normas/public`. NUNCA inclui `justificativa`
 * de falta nem CPF — só nome, partido e a situação (PRESENTE/AUSENTE/JUSTIFICADO).
 */
@Injectable()
export class GetResumoPublicoSessaoUseCase {
    constructor(private readonly prisma: PrismaService) {}

    async buscarDados(sessaoId: string): Promise<ResumoPublicoDados> {
        const sessao = await this.prisma.sessaoPlenaria.findFirst({
            where: { id: sessaoId, isRemoved: false, statusSessao: 'ENCERRADA' },
            include: {
                tipoSessao: { select: { nome: true } },
                presencas: {
                    include: {
                        parlamentar: { include: { pessoa: true } },
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
                    include: { materia: { include: { tipo: true } } },
                },
            },
        });
        if (!sessao) {
            throw new NotFoundException(
                'Sessão não encontrada ou ainda não disponível para consulta pública',
            );
        }

        const board = await this.prisma.board.findFirst({
            where: { tenantId: sessao.tenantId, status: 'ACTIVE', isRemoved: false },
            include: { members: { include: { parliamentarian: true, boardRole: true } } },
        });

        const mesaDiretora = (board?.members ?? []).map((m) => ({
            nome: m.parliamentarian.parliamentaryName,
            cargo: m.boardRole.name,
        }));

        const presencas = sessao.presencas.map((p) => {
            const nome =
                p.parliamentarian?.parliamentaryName ??
                p.parlamentar?.pessoa?.nomeParlamentar ??
                p.parlamentar?.pessoa?.nome ??
                'Parlamentar';
            const partido = p.parliamentarian?.parliamentarianUser?.politicalParty?.acronym ?? null;
            return { nome, partido, situacao: p.situacao };
        });

        const materias = sessao.pautaItens
            .filter((item) => item.materia)
            .map((item) => ({
                identificacao: `${item.materia!.sigla ?? item.materia!.tipo?.nome ?? 'Matéria'} nº ${
                    item.materia!.numero ?? '—'
                }`,
                ementa: item.materia!.ementa,
                resultado: item.resultado,
            }));

        return {
            sessaoTitulo: sessao.tipoSessao?.nome ?? 'Sessão Plenária',
            dataAbertura: sessao.dataAbertura,
            dataEncerramento: sessao.dataEncerramento,
            mesaDiretora,
            presencas,
            materias,
        };
    }

    async execute(sessaoId: string) {
        return this.buscarDados(sessaoId);
    }
}
