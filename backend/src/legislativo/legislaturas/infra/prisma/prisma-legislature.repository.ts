import { Injectable } from '@nestjs/common';
import { Legislature as PrismaLegislature, Prisma } from '@prisma/client';
import { paginatedQuery } from '../../../../common/prisma/paginate';
import { assertTenantScopedUpdate } from '../../../../common/prisma/tenant-scoped-update';
import { PrismaService } from '../../../../prisma/prisma.service';
import { LegislatureEntity } from '../../domain/entities/legislature.entity';
import {
    CreateLegislatureRepositoryInput,
    LegislatureRepository,
    ListLegislaturesRepositoryQuery,
    UpdateLegislatureRepositoryInput,
} from '../../domain/repositories/legislature.repository';

@Injectable()
export class PrismaLegislatureRepository extends LegislatureRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async create(data: CreateLegislatureRepositoryInput) {
        return this.prisma.$transaction(async (tx) => {
            if (data.isCurrent) {
                await tx.legislature.updateMany({
                    where: {
                        tenantId: data.tenantId,
                        isRemoved: false,
                        isCurrent: true,
                    },
                    data: { isCurrent: false },
                });
            }

            const row = await tx.legislature.create({
                data: {
                    tenantId: data.tenantId,
                    number: data.number,
                    startDate: data.startDate,
                    endDate: data.endDate ?? null,
                    isCurrent: data.isCurrent ?? false,
                },
            });
            return this.toEntity(row);
        });
    }

    async findMany(tenantId: string, query: ListLegislaturesRepositoryQuery) {
        const where: Prisma.LegislatureWhereInput = {
            tenantId,
            isRemoved: false,
        };
        if (query.isCurrent !== undefined) where.isCurrent = query.isCurrent;
        if (query.search?.trim()) {
            const term = query.search.trim();
            const parsedNumber = Number.parseInt(term, 10);
            if (!Number.isNaN(parsedNumber)) {
                where.number = parsedNumber;
            }
        }
        return paginatedQuery(
            () => this.prisma.legislature.count({ where }),
            (skip, take) =>
                this.prisma.legislature
                    .findMany({
                        where,
                        orderBy: { number: 'desc' },
                        skip,
                        take,
                    })
                    .then((rows) => rows.map((r) => this.toEntity(r))),
            { page: query.page, limit: query.limit },
        );
    }

    async findById(tenantId: string, id: string) {
        const row = await this.prisma.legislature.findFirst({
            where: { id, tenantId, isRemoved: false },
        });
        return row ? this.toEntity(row) : null;
    }

    async existsByNumber(tenantId: string, number: number, ignoreId?: string) {
        const row = await this.prisma.legislature.findFirst({
            where: {
                tenantId,
                number,
                isRemoved: false,
                ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
            },
            select: { id: true },
        });
        return Boolean(row);
    }

    async findCurrent(tenantId: string) {
        const row = await this.prisma.legislature.findFirst({
            where: { tenantId, isCurrent: true, isRemoved: false },
        });
        return row ? this.toEntity(row) : null;
    }

    async clearCurrentExcept(tenantId: string, exceptId?: string) {
        await this.prisma.legislature.updateMany({
            where: {
                tenantId,
                isRemoved: false,
                isCurrent: true,
                ...(exceptId ? { NOT: { id: exceptId } } : {}),
            },
            data: { isCurrent: false },
        });
    }

    async update(
        tenantId: string,
        id: string,
        data: UpdateLegislatureRepositoryInput,
    ) {
        return this.prisma.$transaction(async (tx) => {
            if (data.isCurrent === true) {
                await tx.legislature.updateMany({
                    where: {
                        tenantId,
                        isRemoved: false,
                        isCurrent: true,
                        NOT: { id },
                    },
                    data: { isCurrent: false },
                });
            }

            const result = await tx.legislature.updateMany({
                where: { id, tenantId, isRemoved: false },
                data: {
                    ...(data.number !== undefined ? { number: data.number } : {}),
                    ...(data.startDate !== undefined
                        ? { startDate: data.startDate }
                        : {}),
                    ...(data.endDate !== undefined
                        ? { endDate: data.endDate }
                        : {}),
                    ...(data.isCurrent !== undefined
                        ? { isCurrent: data.isCurrent }
                        : {}),
                },
            });
            assertTenantScopedUpdate(result.count, 'Legislatura não encontrada');

            const row = await tx.legislature.findFirst({
                where: { id, tenantId, isRemoved: false },
            });
            if (!row) throw new Error('Legislatura não encontrada');
            return this.toEntity(row);
        });
    }

    async softDelete(tenantId: string, id: string) {
        await this.prisma.legislature.updateMany({
            where: { id, tenantId, isRemoved: false },
            data: {
                isRemoved: true,
                removedAt: new Date(),
                isCurrent: false,
            },
        });
    }

    async countCurrentLegislatures(tenantId: string, exceptId?: string) {
        return this.prisma.legislature.count({
            where: {
                tenantId,
                isRemoved: false,
                isCurrent: true,
                ...(exceptId ? { NOT: { id: exceptId } } : {}),
            },
        });
    }

    async countActiveMandates(tenantId: string, legislatureId: string) {
        return this.prisma.parliamentarianMandate.count({
            where: {
                tenantId,
                legislatureId,
                isRemoved: false,
                status: 'ACTIVE',
            },
        });
    }

    private toEntity(row: PrismaLegislature) {
        return LegislatureEntity.restore({
            id: row.id,
            tenantId: row.tenantId,
            number: row.number,
            startDate: row.startDate,
            endDate: row.endDate,
            isCurrent: row.isCurrent,
            isRemoved: row.isRemoved,
            removedAt: row.removedAt,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }
}
