import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { CondicaoMandato } from '../../../mandatos/domain/enums/condicao-mandato.enum';
import {
    AcaoSubstituicaoHistorico,
    MotivoSubstituicao,
    StatusSubstituicao,
} from '../../domain/enums/substituicao.enums';
import {
    AtualizarSubstituicaoDados,
    CriarSubstituicaoDados,
    MandatoAtivoResumo,
    RegistroHistorico,
    ResponsavelResumo,
    SubstituicaoHistoricoRecord,
    SubstituicaoRecord,
    SubstituicaoRepository,
    SuplenteElegivel,
} from '../../domain/repositories/substituicao.repository';
import {
    colunaDeDataCivil,
    dataCivilDeColuna,
} from '../../domain/services/exercicio-mandato';

const responsavelSelect = {
    select: { id: true, user: { select: { firstName: true, lastName: true } } },
} as const;

const substituicaoInclude = {
    titular: { select: { id: true, parliamentaryName: true } },
    suplente: { select: { id: true, parliamentaryName: true } },
    criadoPor: responsavelSelect,
    encerradoPor: responsavelSelect,
} satisfies Prisma.SubstituicaoMandatoInclude;

type SubstituicaoRow = Prisma.SubstituicaoMandatoGetPayload<{
    include: typeof substituicaoInclude;
}>;

type ResponsavelRow = {
    id: string;
    user: { firstName: string; lastName: string };
} | null;

function toResponsavel(row: ResponsavelRow): ResponsavelResumo | null {
    if (!row) return null;
    return {
        id: row.id,
        nome: `${row.user.firstName} ${row.user.lastName}`.trim(),
    };
}

function toRecord(row: SubstituicaoRow): SubstituicaoRecord {
    return {
        id: row.id,
        tenantId: row.tenantId,
        legislatureId: row.legislatureId,
        titularId: row.titularId,
        suplenteId: row.suplenteId,
        motivo: row.motivo as MotivoSubstituicao,
        dataInicio: dataCivilDeColuna(row.dataInicio),
        dataFim: row.dataFim ? dataCivilDeColuna(row.dataFim) : null,
        observacao: row.observacao,
        status: row.status as StatusSubstituicao,
        encerradaEm: row.encerradaEm,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        titular: row.titular,
        suplente: row.suplente,
        criadoPor: toResponsavel(row.criadoPor),
        encerradoPor: toResponsavel(row.encerradoPor),
    };
}

function historicoData(substituicaoId: string, historico: RegistroHistorico) {
    return {
        substituicaoId,
        acao: historico.acao,
        responsavelId: historico.responsavelId,
        alteracoesJson: (historico.alteracoes ?? undefined) as
            | Prisma.InputJsonValue
            | undefined,
    };
}

@Injectable()
export class PrismaSubstituicaoRepository extends SubstituicaoRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async findById(tenantId: string, id: string) {
        const row = await this.prisma.substituicaoMandato.findFirst({
            where: { id, tenantId },
            include: substituicaoInclude,
        });
        return row ? toRecord(row) : null;
    }

    async listByParlamentar(tenantId: string, parliamentarianId: string) {
        const rows = await this.prisma.substituicaoMandato.findMany({
            where: {
                tenantId,
                OR: [{ titularId: parliamentarianId }, { suplenteId: parliamentarianId }],
            },
            include: substituicaoInclude,
            orderBy: [{ dataInicio: 'desc' }, { createdAt: 'desc' }],
        });
        return rows.map(toRecord);
    }

    async listNaoCanceladasEnvolvendo(
        tenantId: string,
        titularId: string,
        suplenteId: string,
        excetoId?: string,
    ) {
        const rows = await this.prisma.substituicaoMandato.findMany({
            where: {
                tenantId,
                status: { not: StatusSubstituicao.CANCELADA },
                OR: [{ titularId }, { suplenteId }],
                ...(excetoId ? { id: { not: excetoId } } : {}),
            },
            include: substituicaoInclude,
        });
        return rows.map(toRecord);
    }

    async findMandatoAtivo(
        tenantId: string,
        parliamentarianId: string,
        legislatureId?: string,
    ): Promise<MandatoAtivoResumo | null> {
        const mandato = await this.prisma.parliamentarianMandate.findFirst({
            where: {
                tenantId,
                parliamentarianId,
                isRemoved: false,
                status: 'ACTIVE',
                parliamentarian: { isRemoved: false },
                ...(legislatureId ? { legislatureId } : {}),
            },
            select: {
                legislatureId: true,
                condicao: true,
                partyAcronym: true,
                parliamentarian: {
                    select: {
                        parliamentarianUser: {
                            select: { politicalParty: { select: { acronym: true } } },
                        },
                    },
                },
            },
            orderBy: [{ legislature: { isCurrent: 'desc' } }, { startedAt: 'desc' }],
        });
        if (!mandato) return null;
        return {
            legislatureId: mandato.legislatureId,
            condicao: mandato.condicao as CondicaoMandato,
            partyAcronym:
                mandato.partyAcronym ??
                mandato.parliamentarian.parliamentarianUser?.politicalParty?.acronym ??
                null,
        };
    }

    async listSuplentesElegiveis(
        tenantId: string,
        legislatureId: string,
    ): Promise<SuplenteElegivel[]> {
        const rows = await this.prisma.parliamentarianMandate.findMany({
            where: {
                tenantId,
                legislatureId,
                isRemoved: false,
                status: 'ACTIVE',
                condicao: CondicaoMandato.SUPLENTE,
                parliamentarian: { isRemoved: false },
            },
            select: {
                partyAcronym: true,
                parliamentarian: {
                    select: {
                        id: true,
                        parliamentaryName: true,
                        parliamentarianUser: {
                            select: { politicalParty: { select: { acronym: true } } },
                        },
                    },
                },
            },
            orderBy: { parliamentarian: { parliamentaryName: 'asc' } },
        });
        return rows.map((r) => ({
            id: r.parliamentarian.id,
            parliamentaryName: r.parliamentarian.parliamentaryName,
            partyAcronym:
                r.partyAcronym ??
                r.parliamentarian.parliamentarianUser?.politicalParty?.acronym ??
                null,
        }));
    }

    async create(
        dados: CriarSubstituicaoDados,
        historico: RegistroHistorico,
        criadoPorId: string | null,
    ) {
        const row = await this.prisma.$transaction(async (tx) => {
            const created = await tx.substituicaoMandato.create({
                data: {
                    tenantId: dados.tenantId,
                    legislatureId: dados.legislatureId,
                    titularId: dados.titularId,
                    suplenteId: dados.suplenteId,
                    motivo: dados.motivo,
                    dataInicio: colunaDeDataCivil(dados.dataInicio),
                    dataFim: dados.dataFim ? colunaDeDataCivil(dados.dataFim) : null,
                    observacao: dados.observacao,
                    criadoPorId,
                },
                include: substituicaoInclude,
            });
            await tx.substituicaoHistorico.create({
                data: historicoData(created.id, historico),
            });
            return created;
        });
        return toRecord(row);
    }

    async update(
        tenantId: string,
        id: string,
        dados: AtualizarSubstituicaoDados,
        historico: RegistroHistorico,
    ) {
        const data: Prisma.SubstituicaoMandatoUncheckedUpdateInput = {};
        if (dados.dataInicio !== undefined) {
            data.dataInicio = colunaDeDataCivil(dados.dataInicio);
        }
        if (dados.dataFim !== undefined) {
            data.dataFim = dados.dataFim ? colunaDeDataCivil(dados.dataFim) : null;
        }
        if (dados.observacao !== undefined) data.observacao = dados.observacao;
        if (dados.status !== undefined) data.status = dados.status;
        if (dados.encerradaEm !== undefined) data.encerradaEm = dados.encerradaEm;
        if (dados.encerradoPorId !== undefined) data.encerradoPorId = dados.encerradoPorId;

        const row = await this.prisma.$transaction(async (tx) => {
            const { count } = await tx.substituicaoMandato.updateMany({
                where: { id, tenantId },
                data,
            });
            if (count === 0) {
                throw new Error('Substituição não encontrada');
            }
            await tx.substituicaoHistorico.create({
                data: historicoData(id, historico),
            });
            return tx.substituicaoMandato.findUniqueOrThrow({
                where: { id },
                include: substituicaoInclude,
            });
        });
        return toRecord(row);
    }

    async listHistorico(
        tenantId: string,
        id: string,
    ): Promise<SubstituicaoHistoricoRecord[]> {
        const rows = await this.prisma.substituicaoHistorico.findMany({
            where: { substituicaoId: id, substituicao: { tenantId } },
            include: { responsavel: responsavelSelect },
            orderBy: { dataHora: 'asc' },
        });
        return rows.map((r) => ({
            id: r.id,
            acao: r.acao as AcaoSubstituicaoHistorico,
            dataHora: r.dataHora,
            responsavel: toResponsavel(r.responsavel),
            alteracoes: r.alteracoesJson,
        }));
    }
}
