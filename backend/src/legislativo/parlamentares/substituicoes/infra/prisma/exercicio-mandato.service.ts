import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { ParliamentarianStatus } from '../../../domain/enums/parliamentarian-status.enum';
import { CondicaoMandato } from '../../../mandatos/domain/enums/condicao-mandato.enum';
import { StatusSubstituicao } from '../../domain/enums/substituicao.enums';
import {
    assertParlamentarAtivo,
    assertPodeExercerMandato,
    colunaDeDataCivil,
    DataCivil,
    dataCivilDeColuna,
    dataCivilDoInstante,
    resolverVagas,
    VagaEmExercicio,
} from '../../domain/services/exercicio-mandato';

export type ElencoExercicioSessao = {
    legislatureId: string | null;
    /** Elenco congelado na abertura da sessão (mudanças posteriores não o afetam). */
    congelado: boolean;
    vagas: VagaEmExercicio[];
};

const STATUS_QUE_CONGELAM = new Set(['ABERTA', 'SUSPENSA']);

/**
 * Fonte única de "quem exerce o mandato": presença, voto, chamada, quórum e painel
 * consultam este serviço para contar cada vaga uma única vez.
 */
@Injectable()
export class ExercicioMandatoService {
    constructor(private readonly prisma: PrismaService) {}

    async vagasNaData(
        tenantId: string,
        legislatureId: string | null,
        data: DataCivil,
    ): Promise<VagaEmExercicio[]> {
        const dataColuna = colunaDeDataCivil(data);
        const [titulares, substituicoes] = await Promise.all([
            this.prisma.parliamentarianMandate.findMany({
                where: {
                    tenantId,
                    isRemoved: false,
                    status: 'ACTIVE',
                    condicao: CondicaoMandato.TITULAR,
                    parliamentarian: { isRemoved: false },
                    ...(legislatureId ? { legislatureId } : {}),
                },
                select: { parliamentarianId: true },
                distinct: ['parliamentarianId'],
            }),
            this.prisma.substituicaoMandato.findMany({
                where: {
                    tenantId,
                    status: { not: StatusSubstituicao.CANCELADA },
                    dataInicio: { lte: dataColuna },
                    OR: [{ dataFim: null }, { dataFim: { gte: dataColuna } }],
                    ...(legislatureId ? { legislatureId } : {}),
                },
                select: {
                    id: true,
                    titularId: true,
                    suplenteId: true,
                    dataInicio: true,
                    dataFim: true,
                    status: true,
                },
            }),
        ]);

        const vagas = resolverVagas(
            titulares.map((t) => t.parliamentarianId),
            substituicoes.map((s) => ({
                id: s.id,
                titularId: s.titularId,
                suplenteId: s.suplenteId,
                dataInicio: dataCivilDeColuna(s.dataInicio),
                dataFim: s.dataFim ? dataCivilDeColuna(s.dataFim) : null,
                status: s.status as StatusSubstituicao,
            })),
            data,
        );
        return this.semOcupantesInativos(tenantId, vagas);
    }

    /** Parlamentar inativo não exerce: sua vaga sai da chamada e do quórum. */
    private async semOcupantesInativos(
        tenantId: string,
        vagas: VagaEmExercicio[],
    ): Promise<VagaEmExercicio[]> {
        if (vagas.length === 0) return vagas;
        const inativos = await this.prisma.parliamentarian.findMany({
            where: {
                tenantId,
                id: { in: vagas.map((v) => v.emExercicioId) },
                status: ParliamentarianStatus.INACTIVE,
            },
            select: { id: true },
        });
        if (inativos.length === 0) return vagas;
        const idsInativos = new Set(inativos.map((p) => p.id));
        return vagas.filter((v) => !idsInativos.has(v.emExercicioId));
    }

    async elencoDaSessao(tenantId: string, sessaoId: string): Promise<ElencoExercicioSessao> {
        const sessao = await this.prisma.sessaoPlenaria.findFirst({
            where: { id: sessaoId, tenantId, isRemoved: false },
            select: {
                dataInicio: true,
                statusSessao: true,
                sessaoLegislativa: {
                    select: { legislatura: { select: { numero: true } } },
                },
                elencoExercicio: {
                    select: { titularId: true, emExercicioId: true, substituicaoId: true },
                },
            },
        });
        if (!sessao) throw new NotFoundException('Sessão plenária não encontrada');

        const legislatureId = await this.resolveLegislatureId(
            tenantId,
            sessao.sessaoLegislativa?.legislatura?.numero ?? null,
        );

        if (sessao.elencoExercicio.length > 0) {
            return { legislatureId, congelado: true, vagas: sessao.elencoExercicio };
        }

        const dataSessao = dataCivilDoInstante(sessao.dataInicio);
        let vagas = await this.vagasNaData(tenantId, legislatureId, dataSessao);
        // Sessão ligada a uma legislatura sem titulares (cadastro PT/EN divergente):
        // conta todos os titulares ativos, como o quórum fazia antes das vagas.
        if (vagas.length === 0 && legislatureId) {
            vagas = await this.vagasNaData(tenantId, null, dataSessao);
        }

        if (STATUS_QUE_CONGELAM.has(sessao.statusSessao) && vagas.length > 0) {
            await this.persistirElenco(sessaoId, vagas);
            return { legislatureId, congelado: true, vagas };
        }
        return { legislatureId, congelado: false, vagas };
    }

    /** Chamado na abertura: a partir daqui a sessão ignora mudanças de substituição. */
    async congelarElencoDaSessao(tenantId: string, sessaoId: string): Promise<void> {
        await this.elencoDaSessao(tenantId, sessaoId);
    }

    async idsEmExercicioDaSessao(tenantId: string, sessaoId: string): Promise<Set<string>> {
        const { vagas } = await this.elencoDaSessao(tenantId, sessaoId);
        return new Set(vagas.map((v) => v.emExercicioId));
    }

    async assertPodeExercerNaSessao(
        tenantId: string,
        sessaoId: string,
        parliamentarianId: string,
    ): Promise<void> {
        const parlamentar = await this.prisma.parliamentarian.findFirst({
            where: { id: parliamentarianId, tenantId },
            select: { status: true },
        });
        assertParlamentarAtivo(parlamentar?.status);

        const { legislatureId, vagas } = await this.elencoDaSessao(tenantId, sessaoId);
        if (vagas.some((v) => v.emExercicioId === parliamentarianId)) return;

        const mandato = await this.prisma.parliamentarianMandate.findFirst({
            where: {
                tenantId,
                parliamentarianId,
                isRemoved: false,
                status: 'ACTIVE',
                ...(legislatureId ? { legislatureId } : {}),
            },
            select: { condicao: true },
        });
        assertPodeExercerMandato(
            parliamentarianId,
            vagas,
            (mandato?.condicao as CondicaoMandato | undefined) ?? null,
        );
    }

    private async persistirElenco(sessaoId: string, vagas: VagaEmExercicio[]) {
        await this.prisma.sessaoElencoExercicio.createMany({
            data: vagas.map((v) => ({
                sessaoId,
                titularId: v.titularId,
                emExercicioId: v.emExercicioId,
                substituicaoId: v.substituicaoId,
            })),
            skipDuplicates: true,
        });
    }

    private async resolveLegislatureId(
        tenantId: string,
        legislaturaNumero: number | null,
    ): Promise<string | null> {
        if (legislaturaNumero != null) {
            const byNumber = await this.prisma.legislature.findFirst({
                where: { tenantId, number: legislaturaNumero, isRemoved: false },
                select: { id: true },
            });
            if (byNumber) return byNumber.id;
        }
        const current = await this.prisma.legislature.findFirst({
            where: { tenantId, isCurrent: true, isRemoved: false },
            select: { id: true },
        });
        return current?.id ?? null;
    }
}
