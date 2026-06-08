import { Injectable } from '@nestjs/common';
import { Ato as PrismaAto, Prisma } from '@prisma/client';
import { buildDateRangeFilter } from '../../../../common/prisma/date-fields';
import { paginatedQuery } from '../../../../common/prisma/paginate';
import { PrismaService } from '../../../../prisma/prisma.service';
import { AtoEntity } from '../../domain/entities/ato.entity';
import {
    AtoRepository,
    CreateAtoRepositoryInput,
    ListAtosRepositoryQuery,
    UpdateAtoRepositoryInput,
} from '../../domain/repositories/ato.repository';

const atoInclude = {
    tipo: true,
    classificacao: true,
} as const;

type PrismaAtoWithRelations = PrismaAto & {
    tipo: { id: string; nome: string };
    classificacao: { id: string; nome: string };
};

@Injectable()
export class PrismaAtoRepository extends AtoRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async create(data: CreateAtoRepositoryInput) {
        const row = await this.prisma.ato.create({
            data: {
                tipoId: data.tipoId,
                classificacaoId: data.classificacaoId,
                numero: data.numero,
                dataInicio: data.dataInicio ?? undefined,
                dataFim: data.dataFim ?? undefined,
                dataPublicacaoInicio: data.dataPublicacaoInicio ?? undefined,
                dataPublicacaoFim: data.dataPublicacaoFim ?? undefined,
                mensagem: data.mensagem ?? undefined,
            },
            include: atoInclude,
        });
        return this.toEntity(row);
    }

    async findMany(query: ListAtosRepositoryQuery) {
        const where: Prisma.AtoWhereInput = {};
        if (query.tipoId) where.tipoId = query.tipoId;
        if (query.classificacaoId) {
            where.classificacaoId = query.classificacaoId;
        }
        if (query.numero) where.numero = { contains: query.numero };

        const pubRange = buildDateRangeFilter(
            query.dataPublicacaoDe,
            query.dataPublicacaoAte,
        );
        if (pubRange) where.dataPublicacaoInicio = pubRange;

        const inicioRange = buildDateRangeFilter(
            query.dataInicioDe,
            query.dataInicioAte,
        );
        if (inicioRange) where.dataInicio = inicioRange;

        const fimRange = buildDateRangeFilter(query.dataFimDe, query.dataFimAte);
        if (fimRange) where.dataFim = fimRange;

        return paginatedQuery(
            () => this.prisma.ato.count({ where }),
            (skip, take) =>
                this.prisma.ato
                    .findMany({
                        where,
                        include: atoInclude,
                        orderBy: { createdAt: 'desc' },
                        skip,
                        take,
                    })
                    .then((rows) => rows.map((row) => this.toEntity(row))),
            { page: query.page, limit: query.limit },
        );
    }

    async findById(id: string) {
        const row = await this.prisma.ato.findUnique({
            where: { id },
            include: atoInclude,
        });
        return row ? this.toEntity(row) : null;
    }

    async update(id: string, data: UpdateAtoRepositoryInput) {
        const row = await this.prisma.ato.update({
            where: { id },
            data: {
                ...(data.tipoId !== undefined ? { tipoId: data.tipoId } : {}),
                ...(data.classificacaoId !== undefined
                    ? { classificacaoId: data.classificacaoId }
                    : {}),
                ...(data.numero !== undefined ? { numero: data.numero } : {}),
                ...(data.dataInicio !== undefined
                    ? { dataInicio: data.dataInicio }
                    : {}),
                ...(data.dataFim !== undefined ? { dataFim: data.dataFim } : {}),
                ...(data.dataPublicacaoInicio !== undefined
                    ? { dataPublicacaoInicio: data.dataPublicacaoInicio }
                    : {}),
                ...(data.dataPublicacaoFim !== undefined
                    ? { dataPublicacaoFim: data.dataPublicacaoFim }
                    : {}),
                ...(data.mensagem !== undefined ? { mensagem: data.mensagem } : {}),
            },
            include: atoInclude,
        });
        return this.toEntity(row);
    }

    async remove(id: string) {
        await this.prisma.ato.delete({ where: { id } });
    }

    async existsByNumero(numero: string, ignoreAtoId?: string) {
        const row = await this.prisma.ato.findFirst({
            where: {
                numero,
                ...(ignoreAtoId ? { NOT: { id: ignoreAtoId } } : {}),
            },
            select: { id: true },
        });
        return Boolean(row);
    }

    async existsTipoAto(tipoId: string) {
        const row = await this.prisma.tipoAto.findUnique({
            where: { id: tipoId },
            select: { id: true },
        });
        return Boolean(row);
    }

    async existsClassificacaoAto(classificacaoId: string) {
        const row = await this.prisma.classificacaoAto.findUnique({
            where: { id: classificacaoId },
            select: { id: true },
        });
        return Boolean(row);
    }

    private toEntity(row: PrismaAtoWithRelations) {
        return AtoEntity.restore({
            id: row.id,
            tipoId: row.tipoId,
            classificacaoId: row.classificacaoId,
            numero: row.numero,
            dataInicio: row.dataInicio,
            dataFim: row.dataFim,
            dataPublicacaoInicio: row.dataPublicacaoInicio,
            dataPublicacaoFim: row.dataPublicacaoFim,
            mensagem: row.mensagem,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            tipo: row.tipo,
            classificacao: row.classificacao,
        });
    }
}
