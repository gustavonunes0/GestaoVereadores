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
    parliamentarianUser: {
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
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
        },
    },
    _count: {
        select: {
            mandates: { where: { isRemoved: false } },
            authoredMatters: { where: { isRemoved: false } },
            matterCoauthorships: { where: { matter: { isRemoved: false } } },
            committeeMembers: { where: { isRemoved: false } },
            votos: true,
        },
    },
    mandates: {
        where: { isRemoved: false, status: 'ACTIVE' },
        orderBy: { startedAt: 'desc' },
        take: 1,
        select: { id: true, status: true },
    },
} satisfies Prisma.ParliamentarianInclude;

const includeDetailRelations = {
    ...includeRelations,
    committeeMembers: {
        where: { isRemoved: false },
        include: {
            committee: {
                select: { id: true, name: true, acronym: true },
            },
        },
    },
} satisfies Prisma.ParliamentarianInclude;

type ParliamentarianRow = PrismaParliamentarian & {
    parliamentarianUser: {
        isRemoved: boolean;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
        politicalParty: {
            id: string;
            name: string;
            acronym: string;
            flagUrl: string | null;
        } | null;
    } | null;
    _count: {
        mandates: number;
        authoredMatters: number;
        matterCoauthorships: number;
        committeeMembers: number;
        votos: number;
    };
    mandates: Array<{ id: string; status: string }>;
};

type ParliamentarianDetailRow = ParliamentarianRow & {
    committeeMembers: Array<{
        committee: { id: string; name: string; acronym: string | null };
    }>;
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
            where.parliamentarianUser = {
                isRemoved: false,
                politicalPartyId: query.politicalPartyId,
            };
        }
        if (query.search?.trim()) {
            const term = query.search.trim();
            where.OR = [
                { parliamentaryName: { contains: term, mode: 'insensitive' } },
                { officeNumber: { contains: term, mode: 'insensitive' } },
                {
                    parliamentarianUser: {
                        user: {
                            firstName: { contains: term, mode: 'insensitive' },
                        },
                    },
                },
                {
                    parliamentarianUser: {
                        user: {
                            lastName: { contains: term, mode: 'insensitive' },
                        },
                    },
                },
                {
                    parliamentarianUser: {
                        politicalParty: {
                            name: { contains: term, mode: 'insensitive' },
                        },
                    },
                },
                {
                    parliamentarianUser: {
                        politicalParty: {
                            acronym: { contains: term, mode: 'insensitive' },
                        },
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
            include: includeDetailRelations,
        });
        return row ? this.toWithRelations(row as ParliamentarianDetailRow) : null;
    }

    async findProfileById(tenantId: string, id: string) {
        return this.prisma.parliamentarian.findFirst({
            where: { id, tenantId, isRemoved: false },
            include: {
                parliamentarianUser: {
                    where: { isRemoved: false },
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
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
                    },
                },
                mandates: {
                    where: { isRemoved: false },
                    orderBy: { startedAt: 'desc' },
                    include: {
                        legislature: {
                            select: { id: true, number: true },
                        },
                    },
                },
                committeeMembers: {
                    where: { isRemoved: false },
                    include: {
                        committee: {
                            select: { id: true, name: true, acronym: true },
                        },
                    },
                },
                parliamentaryFrontMembers: {
                    where: { isRemoved: false },
                    include: {
                        front: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });
    }

    async update(
        tenantId: string,
        id: string,
        data: UpdateParliamentarianRepositoryInput,
    ) {
        const result = await this.prisma.parliamentarian.updateMany({
            where: { id, tenantId, isRemoved: false },
            data: {
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

    private toWithRelations(row: ParliamentarianRow | ParliamentarianDetailRow): ParliamentarianWithRelations {
        const activeMandate = row.mandates[0] ?? null;
        const committees =
            'committeeMembers' in row
                ? row.committeeMembers.map((m) => ({
                      id: m.committee.id,
                      name: m.committee.name,
                      acronym: m.committee.acronym,
                  }))
                : undefined;
        const parlUser =
            row.parliamentarianUser && !row.parliamentarianUser.isRemoved
                ? row.parliamentarianUser
                : null;

        return {
            entity: ParliamentarianEntity.restore({
                id: row.id,
                tenantId: row.tenantId,
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
            ...(parlUser?.user
                ? {
                      user: {
                          ...parlUser.user,
                          politicalParty: parlUser.politicalParty,
                      },
                  }
                : {}),
            activeMandatesCount: row._count.mandates,
            stats: {
                authoredMattersCount: row._count.authoredMatters,
                coauthoredMattersCount: row._count.matterCoauthorships,
                committeeMembersCount: row._count.committeeMembers,
                sessionVotesCount: row._count.votos,
            },
            activeMandate,
            ...(committees ? { committees } : {}),
        };
    }
}
