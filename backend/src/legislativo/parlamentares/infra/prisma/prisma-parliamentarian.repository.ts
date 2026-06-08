import { Injectable } from '@nestjs/common';
import { Parliamentarian as PrismaParliamentarian, Prisma } from '@prisma/client';
import { paginatedQuery } from '../../../../common/prisma/paginate';
import { assertTenantScopedUpdate } from '../../../../common/prisma/tenant-scoped-update';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ParliamentarianEntity } from '../../domain/entities/parliamentarian.entity';
import { ParliamentarianStatus } from '../../domain/enums/parliamentarian-status.enum';
import {
    CreateParliamentarianRepositoryInput,
    ListParliamentariansRepositoryQuery,
    ParliamentarianRepository,
    ParliamentarianWithRelations,
    UpdateParliamentarianRepositoryInput,
} from '../../domain/repositories/parliamentarian.repository';

const includeRelations = {
    tenantUser: {
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
    },
    politicalParty: {
        select: {
            id: true,
            name: true,
            acronym: true,
            flagUrl: true,
        },
    },
    _count: {
        select: {
            mandates: { where: { isRemoved: false } },
        },
    },
} satisfies Prisma.ParliamentarianInclude;

type ParliamentarianRow = PrismaParliamentarian & {
    tenantUser: {
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
    };
    politicalParty: {
        id: string;
        name: string;
        acronym: string;
        flagUrl: string | null;
    } | null;
    _count: { mandates: number };
};

@Injectable()
export class PrismaParliamentarianRepository extends ParliamentarianRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async create(data: CreateParliamentarianRepositoryInput) {
        const row = await this.prisma.parliamentarian.create({
            data: {
                tenantId: data.tenantId,
                tenantUserId: data.tenantUserId,
                politicalPartyId: data.politicalPartyId ?? null,
                parliamentaryName: data.parliamentaryName,
                officeNumber: data.officeNumber ?? null,
                photoUrl: data.photoUrl ?? null,
                biography: data.biography ?? null,
            },
            include: includeRelations,
        });
        return this.toWithRelations(row);
    }

    async findMany(tenantId: string, query: ListParliamentariansRepositoryQuery) {
        const where: Prisma.ParliamentarianWhereInput = {
            tenantId,
            isRemoved: false,
        };
        if (query.status) where.status = query.status;
        if (query.politicalPartyId) {
            where.politicalPartyId = query.politicalPartyId;
        }
        if (query.search?.trim()) {
            const term = query.search.trim();
            where.OR = [
                { parliamentaryName: { contains: term, mode: 'insensitive' } },
                { officeNumber: { contains: term, mode: 'insensitive' } },
                {
                    tenantUser: {
                        user: {
                            firstName: { contains: term, mode: 'insensitive' },
                        },
                    },
                },
                {
                    tenantUser: {
                        user: {
                            lastName: { contains: term, mode: 'insensitive' },
                        },
                    },
                },
                {
                    politicalParty: {
                        name: { contains: term, mode: 'insensitive' },
                    },
                },
                {
                    politicalParty: {
                        acronym: { contains: term, mode: 'insensitive' },
                    },
                },
            ];
        }
        return paginatedQuery(
            () => this.prisma.parliamentarian.count({ where }),
            (skip, take) =>
                this.prisma.parliamentarian
                    .findMany({
                        where,
                        include: includeRelations,
                        orderBy: { parliamentaryName: 'asc' },
                        skip,
                        take,
                    })
                    .then((rows) => rows.map((r) => this.toWithRelations(r))),
            { page: query.page, limit: query.limit },
        );
    }

    async findById(tenantId: string, id: string) {
        const row = await this.prisma.parliamentarian.findFirst({
            where: { id, tenantId, isRemoved: false },
            include: includeRelations,
        });
        return row ? this.toWithRelations(row) : null;
    }

    async existsByTenantUserId(
        tenantId: string,
        tenantUserId: string,
        ignoreId?: string,
    ) {
        const row = await this.prisma.parliamentarian.findFirst({
            where: {
                tenantId,
                tenantUserId,
                isRemoved: false,
                ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
            },
            select: { id: true },
        });
        return Boolean(row);
    }

    async findRemovedByTenantUserId(tenantId: string, tenantUserId: string) {
        const row = await this.prisma.parliamentarian.findFirst({
            where: { tenantId, tenantUserId, isRemoved: true },
            include: includeRelations,
        });
        return row ? this.toWithRelations(row) : null;
    }

    async reactivate(
        tenantId: string,
        id: string,
        data: CreateParliamentarianRepositoryInput,
    ) {
        const result = await this.prisma.parliamentarian.updateMany({
            where: { id, tenantId, isRemoved: true },
            data: {
                isRemoved: false,
                removedAt: null,
                status: ParliamentarianStatus.ACTIVE,
                politicalPartyId: data.politicalPartyId ?? null,
                parliamentaryName: data.parliamentaryName,
                officeNumber: data.officeNumber ?? null,
                photoUrl: data.photoUrl ?? null,
                biography: data.biography ?? null,
            },
        });
        assertTenantScopedUpdate(result.count, 'Parlamentar não encontrado');

        const row = await this.prisma.parliamentarian.findFirst({
            where: { id, tenantId, isRemoved: false },
            include: includeRelations,
        });
        if (!row) {
            throw new Error('Parlamentar não encontrado');
        }
        return this.toWithRelations(row);
    }

    async update(
        tenantId: string,
        id: string,
        data: UpdateParliamentarianRepositoryInput,
    ) {
        const result = await this.prisma.parliamentarian.updateMany({
            where: { id, tenantId, isRemoved: false },
            data: {
                ...(data.politicalPartyId !== undefined
                    ? { politicalPartyId: data.politicalPartyId }
                    : {}),
                ...(data.parliamentaryName !== undefined
                    ? { parliamentaryName: data.parliamentaryName }
                    : {}),
                ...(data.officeNumber !== undefined
                    ? { officeNumber: data.officeNumber }
                    : {}),
                ...(data.photoUrl !== undefined
                    ? { photoUrl: data.photoUrl }
                    : {}),
                ...(data.biography !== undefined
                    ? { biography: data.biography }
                    : {}),
                ...(data.status !== undefined ? { status: data.status } : {}),
            },
        });
        assertTenantScopedUpdate(result.count, 'Parlamentar não encontrado');

        const row = await this.prisma.parliamentarian.findFirst({
            where: { id, tenantId, isRemoved: false },
            include: includeRelations,
        });
        if (!row) {
            throw new Error('Parlamentar não encontrado');
        }
        return this.toWithRelations(row);
    }

    async softDelete(tenantId: string, id: string) {
        await this.prisma.parliamentarian.updateMany({
            where: { id, tenantId, isRemoved: false },
            data: {
                isRemoved: true,
                removedAt: new Date(),
                status: ParliamentarianStatus.REMOVED,
            },
        });
    }

    private toWithRelations(row: ParliamentarianRow): ParliamentarianWithRelations {
        return {
            entity: ParliamentarianEntity.restore({
                id: row.id,
                tenantId: row.tenantId,
                tenantUserId: row.tenantUserId,
                politicalPartyId: row.politicalPartyId,
                parliamentaryName: row.parliamentaryName,
                officeNumber: row.officeNumber,
                photoUrl: row.photoUrl,
                biography: row.biography,
                status: row.status as ParliamentarianStatus,
                isRemoved: row.isRemoved,
                removedAt: row.removedAt,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
            }),
            user: row.tenantUser.user,
            politicalParty: row.politicalParty,
            activeMandatesCount: row._count.mandates,
        };
    }
}
