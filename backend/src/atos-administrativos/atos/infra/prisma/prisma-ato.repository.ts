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
                tenantId: data.tenantId,
                tipoId: data.tipoId,
                classificacaoId: data.classificacaoId,
                numero: data.numero,
                dataInicio: data.dataInicio ?? undefined,
                dataFim: data.dataFim ?? undefined,
                dataPublicacaoInicio: data.dataPublicacaoInicio ?? undefined,
                dataPublicacaoFim: data.dataPublicacaoFim ?? undefined,
                mensagem: data.mensagem ?? undefined,
                ementa: data.ementa ?? undefined,
                dataAto: data.dataAto ?? undefined,
                anexoUrl: data.anexoUrl ?? undefined,
                textoUrl: data.textoUrl ?? undefined,
                identificadorId: data.identificadorId ?? undefined,
            },
            include: atoInclude,
        });
        return this.toEntity(row);
    }

    async findMany(query: ListAtosRepositoryQuery) {
        const where: Prisma.AtoWhereInput = {
            tenantId: query.tenantId,
            isRemoved: false,
        };
        if (query.tipoId) where.tipoId = query.tipoId;
        if (query.classificacaoId) where.classificacaoId = query.classificacaoId;
        if (query.numero) where.numero = { contains: query.numero };

        const pubRange = buildDateRangeFilter(query.dataPublicacaoDe, query.dataPublicacaoAte);
        if (pubRange) where.dataPublicacaoInicio = pubRange;

        const inicioRange = buildDateRangeFilter(query.dataInicioDe, query.dataInicioAte);
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

    async findById(tenantId: string, id: string) {
        const row = await this.prisma.ato.findFirst({
            where: { id, tenantId, isRemoved: false },
            include: atoInclude,
        });
        return row ? this.toEntity(row) : null;
    }

    async update(tenantId: string, id: string, data: UpdateAtoRepositoryInput) {
        const row = await this.prisma.ato.update({
            where: { id },
            data: {
                ...(data.tipoId !== undefined ? { tipoId: data.tipoId } : {}),
                ...(data.classificacaoId !== undefined ? { classificacaoId: data.classificacaoId } : {}),
                ...(data.numero !== undefined ? { numero: data.numero } : {}),
                ...(data.dataInicio !== undefined ? { dataInicio: data.dataInicio } : {}),
                ...(data.dataFim !== undefined ? { dataFim: data.dataFim } : {}),
                ...(data.dataPublicacaoInicio !== undefined ? { dataPublicacaoInicio: data.dataPublicacaoInicio } : {}),
                ...(data.dataPublicacaoFim !== undefined ? { dataPublicacaoFim: data.dataPublicacaoFim } : {}),
                ...(data.mensagem !== undefined ? { mensagem: data.mensagem } : {}),
                ...(data.ementa !== undefined ? { ementa: data.ementa } : {}),
                ...(data.dataAto !== undefined ? { dataAto: data.dataAto } : {}),
                ...(data.anexoUrl !== undefined ? { anexoUrl: data.anexoUrl } : {}),
                ...(data.textoUrl !== undefined ? { textoUrl: data.textoUrl } : {}),
                ...(data.identificadorId !== undefined ? { identificadorId: data.identificadorId } : {}),
            },
            include: atoInclude,
        });
        return this.toEntity(row);
    }

    async remove(tenantId: string, id: string) {
        await this.prisma.ato.updateMany({
            where: { id, tenantId, isRemoved: false },
            data: { isRemoved: true, removedAt: new Date() },
        });
    }

    async existsByNumero(tenantId: string, numero: string, ignoreAtoId?: string) {
        const row = await this.prisma.ato.findFirst({
            where: {
                tenantId,
                numero,
                isRemoved: false,
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
        const r = row as PrismaAtoWithRelations & {
            tenantId?: string | null;
            ementa?: string | null;
            dataAto?: Date | null;
            anexoUrl?: string | null;
            textoUrl?: string | null;
            identificadorId?: string | null;
            isRemoved?: boolean;
        };
        return AtoEntity.restore({
            id: r.id,
            tenantId: r.tenantId ?? null,
            tipoId: r.tipoId,
            classificacaoId: r.classificacaoId,
            numero: r.numero,
            dataInicio: r.dataInicio,
            dataFim: r.dataFim,
            dataPublicacaoInicio: r.dataPublicacaoInicio,
            dataPublicacaoFim: r.dataPublicacaoFim,
            mensagem: r.mensagem,
            ementa: r.ementa ?? null,
            dataAto: r.dataAto ?? null,
            anexoUrl: r.anexoUrl ?? null,
            textoUrl: r.textoUrl ?? null,
            identificadorId: r.identificadorId ?? null,
            isRemoved: r.isRemoved ?? false,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            tipo: r.tipo,
            classificacao: r.classificacao,
        });
    }
}
