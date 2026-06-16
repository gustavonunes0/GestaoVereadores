import { Injectable } from '@nestjs/common';
import { Norma as PrismaNorma, Prisma } from '@prisma/client';
import { buildDateRangeFilter } from '../../../../common/prisma/date-fields';
import { paginatedQuery } from '../../../../common/prisma/paginate';
import { tenantWhere } from '../../../../common/prisma/tenant-scope';
import { assertTenantScopedUpdate } from '../../../../common/prisma/tenant-scoped-update';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
    NormaEntity,
    NormaPrimitives,
} from '../../domain/entities/norma.entity';
import {
    CreateNormaRepositoryInput,
    ListNormasRepositoryQuery,
    NormaRepository,
    RegistrarPromulgacaoInput,
    RegistrarPublicacaoInput,
    RegistrarSancaoInput,
    RegistrarVetoInput,
    RevogarNormaInput,
    UpdateNormaRepositoryInput,
} from '../../domain/repositories/norma.repository';

const createUpdateInclude = {
    tipo: true,
    ano: true,
    materiaOrigem: true,
} as const;

const listInclude = {
    tipo: true,
    ano: true,
} as const;

const detailInclude = {
    tipo: true,
    ano: true,
    materiaOrigem: true,
    esferaFederacao: true,
} as const;

type NormaWithRelations = PrismaNorma & {
    tipo: { id: string; nome: string };
    ano?: { id: string; valor: number } | null;
    materiaOrigem?: {
        id: string;
        ementa: string;
        numero: number | null;
    } | null;
    esferaFederacao?: { id: string; nome: string } | null;
    identificador?: { id: string; nome: string } | null;
};

@Injectable()
export class PrismaNormaRepository extends NormaRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async create(tenantId: string, data: CreateNormaRepositoryInput) {
        const row = await this.prisma.norma.create({
            data: {
                tenantId,
                tipoId: data.tipoId,
                numero: data.numero,
                ementa: data.ementa,
                anoId: data.anoId ?? undefined,
                data: data.data ?? undefined,
                dataPublicacaoInicio: data.dataPublicacaoInicio ?? undefined,
                dataPublicacaoFim: data.dataPublicacaoFim ?? undefined,
                esferaFederacaoId: data.esferaFederacaoId ?? undefined,
                identificadorId: data.identificadorId ?? undefined,
                materiaOrigemId: data.materiaOrigemId ?? undefined,
                mensagem: data.mensagem ?? undefined,
                complementar: data.complementar ?? false,
                textoIntegralUrl: data.textoIntegralUrl ?? undefined,
                audioUrl: data.audioUrl ?? undefined,
                textoUrl: data.textoUrl ?? undefined,
            },
            include: createUpdateInclude,
        });
        return this.toEntity(row);
    }

    async findMany(tenantId: string, query: ListNormasRepositoryQuery) {
        const where = this.buildWhere(tenantId, query);

        return paginatedQuery(
            () => this.prisma.norma.count({ where }),
            (skip, take) =>
                this.prisma.norma
                    .findMany({
                        where,
                        include: listInclude,
                        orderBy: { createdAt: 'desc' },
                        skip,
                        take,
                    })
                    .then((rows) => rows.map((row) => this.toEntity(row))),
            { page: query.page, limit: query.limit },
        );
    }

    async findById(tenantId: string, id: string) {
        const row = await this.prisma.norma.findFirst({
            where: { id, ...tenantWhere(tenantId) },
            include: detailInclude,
        });
        return row ? this.toEntity(row) : null;
    }

    async update(
        tenantId: string,
        id: string,
        data: UpdateNormaRepositoryInput,
    ) {
        const result = await this.prisma.norma.updateMany({
            where: { id, ...tenantWhere(tenantId) },
            data: {
                ...(data.tipoId !== undefined ? { tipoId: data.tipoId } : {}),
                ...(data.numero !== undefined ? { numero: data.numero } : {}),
                ...(data.ementa !== undefined ? { ementa: data.ementa } : {}),
                ...(data.anoId !== undefined ? { anoId: data.anoId } : {}),
                ...(data.data !== undefined ? { data: data.data } : {}),
                ...(data.dataPublicacaoInicio !== undefined
                    ? { dataPublicacaoInicio: data.dataPublicacaoInicio }
                    : {}),
                ...(data.dataPublicacaoFim !== undefined
                    ? { dataPublicacaoFim: data.dataPublicacaoFim }
                    : {}),
                ...(data.esferaFederacaoId !== undefined
                    ? { esferaFederacaoId: data.esferaFederacaoId }
                    : {}),
                ...(data.identificadorId !== undefined
                    ? { identificadorId: data.identificadorId }
                    : {}),
                ...(data.materiaOrigemId !== undefined
                    ? { materiaOrigemId: data.materiaOrigemId }
                    : {}),
                ...(data.mensagem !== undefined ? { mensagem: data.mensagem } : {}),
                ...(data.complementar !== undefined ? { complementar: data.complementar } : {}),
                ...(data.textoIntegralUrl !== undefined ? { textoIntegralUrl: data.textoIntegralUrl } : {}),
                ...(data.audioUrl !== undefined ? { audioUrl: data.audioUrl } : {}),
                ...(data.textoUrl !== undefined ? { textoUrl: data.textoUrl } : {}),
            },
        });
        assertTenantScopedUpdate(result.count, 'Norma não encontrada');

        const row = await this.prisma.norma.findFirst({
            where: { id, ...tenantWhere(tenantId) },
            include: createUpdateInclude,
        });
        if (!row) {
            throw new Error('Norma não encontrada');
        }
        return this.toEntity(row);
    }

    async softDelete(tenantId: string, id: string) {
        const result = await this.prisma.norma.updateMany({
            where: { id, ...tenantWhere(tenantId) },
            data: { isRemoved: true },
        });
        assertTenantScopedUpdate(result.count, 'Norma não encontrada');
    }

    async findPublic(query: ListNormasRepositoryQuery) {
        const where: Prisma.NormaWhereInput = { isRemoved: false };
        if (query.tipoId) where.tipoId = query.tipoId;
        if (query.anoId) where.anoId = query.anoId;
        if (query.numero) where.numero = { contains: query.numero };
        const dataRange = buildDateRangeFilter(query.dataInicio, query.dataFim);
        if (dataRange) where.data = dataRange;

        return paginatedQuery(
            () => this.prisma.norma.count({ where }),
            (skip, take) =>
                this.prisma.norma
                    .findMany({ where, include: listInclude, orderBy: { createdAt: 'desc' }, skip, take })
                    .then((rows) => rows.map((row) => this.toEntity(row))),
            { page: query.page, limit: query.limit },
        );
    }

    async registrarSancao(tenantId: string, id: string, data: RegistrarSancaoInput) {
        const result = await this.prisma.norma.updateMany({
            where: { id, ...tenantWhere(tenantId) },
            data: {
                dataSancao: data.dataSancao,
                ...(data.textoUrl !== undefined ? { textoUrl: data.textoUrl } : {}),
            },
        });
        assertTenantScopedUpdate(result.count, 'Norma não encontrada');
        return this.findByIdOrFail(tenantId, id);
    }

    async registrarVeto(tenantId: string, id: string, data: RegistrarVetoInput) {
        const result = await this.prisma.norma.updateMany({
            where: { id, ...tenantWhere(tenantId) },
            data: {
                dataVeto: data.dataVeto,
                ...(data.tipoVeto !== undefined ? { tipoVeto: data.tipoVeto } : {}),
                ...(data.motivoVeto !== undefined ? { motivoVeto: data.motivoVeto } : {}),
            },
        });
        assertTenantScopedUpdate(result.count, 'Norma não encontrada');
        return this.findByIdOrFail(tenantId, id);
    }

    async registrarPromulgacao(tenantId: string, id: string, data: RegistrarPromulgacaoInput) {
        const result = await this.prisma.norma.updateMany({
            where: { id, ...tenantWhere(tenantId) },
            data: { dataPromulgacao: data.dataPromulgacao },
        });
        assertTenantScopedUpdate(result.count, 'Norma não encontrada');
        return this.findByIdOrFail(tenantId, id);
    }

    async registrarPublicacao(tenantId: string, id: string, data: RegistrarPublicacaoInput) {
        const result = await this.prisma.norma.updateMany({
            where: { id, ...tenantWhere(tenantId) },
            data: {
                dataPublicacao: data.dataPublicacao,
                ...(data.dataVigencia !== undefined ? { dataVigencia: data.dataVigencia } : {}),
            },
        });
        assertTenantScopedUpdate(result.count, 'Norma não encontrada');
        return this.findByIdOrFail(tenantId, id);
    }

    async revogar(tenantId: string, id: string, data: RevogarNormaInput) {
        const result = await this.prisma.norma.updateMany({
            where: { id, ...tenantWhere(tenantId) },
            data: {
                dataRevogacao: data.dataRevogacao,
                ...(data.normaRevoganteId !== undefined ? { normaRevoganteId: data.normaRevoganteId } : {}),
            },
        });
        assertTenantScopedUpdate(result.count, 'Norma não encontrada');
        return this.findByIdOrFail(tenantId, id);
    }

    private async findByIdOrFail(tenantId: string, id: string): Promise<NormaEntity> {
        const row = await this.prisma.norma.findFirst({
            where: { id, ...tenantWhere(tenantId) },
            include: detailInclude,
        });
        if (!row) throw new Error('Norma não encontrada');
        return this.toEntity(row);
    }

    async existsTipoNorma(tipoId: string) {
        const row = await this.prisma.tipoNorma.findUnique({
            where: { id: tipoId },
            select: { id: true },
        });
        return Boolean(row);
    }

    async existsAno(anoId: string) {
        const row = await this.prisma.ano.findUnique({
            where: { id: anoId },
            select: { id: true },
        });
        return Boolean(row);
    }

    async existsEsferaFederacao(esferaFederacaoId: string) {
        const row = await this.prisma.esferaFederacao.findUnique({
            where: { id: esferaFederacaoId },
            select: { id: true },
        });
        return Boolean(row);
    }

    async existsIdentificadorNorma(identificadorId: string) {
        const row = await this.prisma.identificadorNorma.findUnique({
            where: { id: identificadorId },
            select: { id: true },
        });
        return Boolean(row);
    }

    private buildWhere(tenantId: string, query: ListNormasRepositoryQuery) {
        const where: Prisma.NormaWhereInput = { ...tenantWhere(tenantId) };

        if (query.tipoId) where.tipoId = query.tipoId;
        if (query.anoId) where.anoId = query.anoId;
        if (query.esferaFederacaoId) {
            where.esferaFederacaoId = query.esferaFederacaoId;
        }
        if (query.identificadorId) {
            where.identificadorId = query.identificadorId;
        }
        if (query.materiaOrigemId) {
            where.materiaOrigemId = query.materiaOrigemId;
        }
        if (query.numero) where.numero = { contains: query.numero };

        const dataRange = buildDateRangeFilter(
            query.dataInicio,
            query.dataFim,
        );
        if (dataRange) where.data = dataRange;

        if (query.search?.trim()) {
            const term = query.search.trim();
            where.OR = [
                { numero: { contains: term, mode: 'insensitive' } },
                { ementa: { contains: term, mode: 'insensitive' } },
                { mensagem: { contains: term, mode: 'insensitive' } },
            ];
        }

        return where;
    }

    private toEntity(row: NormaWithRelations) {
        const r = row as NormaWithRelations & {
            dataSancao?: Date | null;
            dataVeto?: Date | null;
            tipoVeto?: string | null;
            motivoVeto?: string | null;
            dataPromulgacao?: Date | null;
            dataPublicacao?: Date | null;
            dataVigencia?: Date | null;
            dataRevogacao?: Date | null;
            normaRevoganteId?: string | null;
            textoUrl?: string | null;
            complementar?: boolean;
            textoIntegralUrl?: string | null;
            audioUrl?: string | null;
            removedAt?: Date | null;
        };
        const props: NormaPrimitives = {
            id: r.id,
            tenantId: r.tenantId,
            tipoId: r.tipoId,
            numero: r.numero,
            ementa: r.ementa,
            anoId: r.anoId,
            data: r.data,
            dataPublicacaoInicio: r.dataPublicacaoInicio,
            dataPublicacaoFim: r.dataPublicacaoFim,
            esferaFederacaoId: r.esferaFederacaoId,
            identificadorId: r.identificadorId,
            materiaOrigemId: r.materiaOrigemId,
            mensagem: r.mensagem,
            dataSancao: r.dataSancao ?? null,
            dataVeto: r.dataVeto ?? null,
            tipoVeto: r.tipoVeto ?? null,
            motivoVeto: r.motivoVeto ?? null,
            dataPromulgacao: r.dataPromulgacao ?? null,
            dataPublicacao: r.dataPublicacao ?? null,
            dataVigencia: r.dataVigencia ?? null,
            dataRevogacao: r.dataRevogacao ?? null,
            normaRevoganteId: r.normaRevoganteId ?? null,
            textoUrl: r.textoUrl ?? null,
            complementar: r.complementar ?? false,
            textoIntegralUrl: r.textoIntegralUrl ?? null,
            audioUrl: r.audioUrl ?? null,
            isRemoved: r.isRemoved,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            tipo: r.tipo,
            ...(r.ano !== undefined ? { ano: r.ano } : {}),
            ...(r.esferaFederacao !== undefined ? { esferaFederacao: r.esferaFederacao } : {}),
            ...(r.identificador !== undefined ? { identificador: r.identificador } : {}),
            ...(r.materiaOrigem !== undefined ? { materiaOrigem: r.materiaOrigem } : {}),
        };
        return NormaEntity.restore(props);
    }
}
