import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { paginatedQuery } from '../../../../common/prisma/paginate';
import { assertTenantScopedUpdate } from '../../../../common/prisma/tenant-scoped-update';
import { tenantWhere } from '../../../../common/prisma/tenant-scope';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CommitteeEntity } from '../../domain/entities/committee.entity';
import { CommitteeMemberRole } from '../../domain/enums/committee-member-role.enum';
import { CommitteeStatus } from '../../domain/enums/committee-status.enum';
import { CommitteeType } from '../../domain/enums/committee-type.enum';
import {
    AddCommitteeMemberRepositoryInput,
    CommitteeMemberWithRelations,
    CommitteeRepository,
    CommitteeWithRelations,
    CreateCommitteeRepositoryInput,
    ListCommitteesRepositoryQuery,
    UpdateCommitteeRepositoryInput,
} from '../../domain/repositories/committee.repository';

const committeeInclude = {
    members: {
        where: { isRemoved: false },
        orderBy: { createdAt: 'asc' as const },
        include: {
            parliamentarian: {
                select: {
                    id: true,
                    parliamentaryName: true,
                    officeNumber: true,
                },
            },
        },
    },
} satisfies Prisma.CommitteeInclude;

type CommitteeRow = Prisma.CommitteeGetPayload<{
    include: typeof committeeInclude;
}>;

@Injectable()
export class PrismaCommitteeRepository extends CommitteeRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async create(data: CreateCommitteeRepositoryInput) {
        const committee = CommitteeEntity.create(data);
        const p = committee.toPrimitives();
        const row = await this.prisma.committee.create({
            data: {
                id: p.id,
                tenantId: p.tenantId,
                name: p.name,
                acronym: p.acronym,
                type: p.type,
                purpose: p.purpose,
                startDate: p.startDate,
                endDate: p.endDate,
                status: p.status,
                notes: p.notes,
            },
            include: committeeInclude,
        });
        return this.toWithRelations(row);
    }

    async findMany(tenantId: string, query: ListCommitteesRepositoryQuery) {
        const where: Prisma.CommitteeWhereInput = {
            ...tenantWhere(tenantId),
            isRemoved: false,
        };
        if (query.type) where.type = query.type;
        if (query.status) where.status = query.status;
        if (query.search?.trim()) {
            where.OR = [
                {
                    name: {
                        contains: query.search.trim(),
                        mode: 'insensitive',
                    },
                },
                {
                    acronym: {
                        contains: query.search.trim(),
                        mode: 'insensitive',
                    },
                },
            ];
        }

        return paginatedQuery(
            () => this.prisma.committee.count({ where }),
            (skip, take) =>
                this.prisma.committee.findMany({
                    where,
                    include: committeeInclude,
                    orderBy: { name: 'asc' },
                    skip,
                    take,
                }),
            query,
        ).then((result) => ({
            ...result,
            data: result.data.map((row) => this.toWithRelations(row)),
        }));
    }

    async findById(tenantId: string, id: string) {
        const row = await this.prisma.committee.findFirst({
            where: { id, ...tenantWhere(tenantId), isRemoved: false },
            include: committeeInclude,
        });
        return row ? this.toWithRelations(row) : null;
    }

    async update(
        tenantId: string,
        id: string,
        data: UpdateCommitteeRepositoryInput,
    ) {
        const existing = await this.findById(tenantId, id);
        if (!existing) throw new Error('Comissão não encontrada');

        existing.entity.update(data);
        const p = existing.entity.toPrimitives();

        const result = await this.prisma.committee.updateMany({
            where: { id, tenantId, isRemoved: false },
            data: {
                name: p.name,
                acronym: p.acronym,
                type: p.type,
                purpose: p.purpose,
                startDate: p.startDate,
                endDate: p.endDate,
                status: p.status,
                notes: p.notes,
            },
        });
        assertTenantScopedUpdate(result.count, 'Comissão não encontrada');

        const row = await this.prisma.committee.findFirst({
            where: { id, tenantId, isRemoved: false },
            include: committeeInclude,
        });
        if (!row) throw new Error('Comissão não encontrada');
        return this.toWithRelations(row);
    }

    async softDelete(tenantId: string, id: string) {
        const result = await this.prisma.committee.updateMany({
            where: { id, tenantId, isRemoved: false },
            data: {
                isRemoved: true,
                removedAt: new Date(),
                status: CommitteeStatus.FINISHED,
            },
        });
        assertTenantScopedUpdate(result.count, 'Comissão não encontrada');
    }

    async existsByAcronym(
        tenantId: string,
        acronym: string,
        ignoreId?: string,
    ) {
        const row = await this.prisma.committee.findFirst({
            where: {
                tenantId,
                acronym: acronym.trim().toUpperCase(),
                isRemoved: false,
                ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
            },
            select: { id: true },
        });
        return Boolean(row);
    }

    async existsMemberByParliamentarian(
        tenantId: string,
        committeeId: string,
        parliamentarianId: string,
    ) {
        const count = await this.prisma.committeeMember.count({
            where: {
                ...tenantWhere(tenantId),
                committeeId,
                parliamentarianId,
                isRemoved: false,
            },
        });
        return count > 0;
    }

    async existsMemberByExclusiveRole(
        tenantId: string,
        committeeId: string,
        role: CommitteeMemberRole,
    ) {
        const count = await this.prisma.committeeMember.count({
            where: {
                ...tenantWhere(tenantId),
                committeeId,
                role,
                isRemoved: false,
            },
        });
        return count > 0;
    }

    async addMember(data: AddCommitteeMemberRepositoryInput) {
        const row = await this.prisma.committeeMember.create({
            data: {
                tenantId: data.tenantId,
                committeeId: data.committeeId,
                parliamentarianId: data.parliamentarianId,
                role: data.role,
            },
            include: {
                parliamentarian: {
                    select: {
                        id: true,
                        parliamentaryName: true,
                        officeNumber: true,
                    },
                },
            },
        });
        return this.toMember(row);
    }

    async removeMember(
        tenantId: string,
        committeeId: string,
        memberId: string,
    ) {
        const result = await this.prisma.committeeMember.updateMany({
            where: {
                id: memberId,
                committeeId,
                ...tenantWhere(tenantId),
                isRemoved: false,
            },
            data: { isRemoved: true, removedAt: new Date() },
        });
        assertTenantScopedUpdate(
            result.count,
            'Membro não encontrado nesta comissão',
        );
    }

    private toWithRelations(row: CommitteeRow): CommitteeWithRelations {
        return {
            entity: CommitteeEntity.restore({
                id: row.id,
                tenantId: row.tenantId,
                name: row.name,
                acronym: row.acronym,
                type: row.type as CommitteeType,
                purpose: row.purpose,
                startDate: row.startDate,
                endDate: row.endDate,
                status: row.status as CommitteeStatus,
                notes: row.notes,
                isRemoved: row.isRemoved,
                removedAt: row.removedAt,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
            }),
            members: row.members.map((member) => this.toMember(member)),
        };
    }

    private toMember(
        row: Prisma.CommitteeMemberGetPayload<{
            include: {
                parliamentarian: {
                    select: {
                        id: true;
                        parliamentaryName: true;
                        officeNumber: true;
                    };
                };
            };
        }>,
    ): CommitteeMemberWithRelations {
        return {
            id: row.id,
            role: row.role as CommitteeMemberRole,
            parliamentarian: {
                id: row.parliamentarian.id,
                parliamentaryName: row.parliamentarian.parliamentaryName,
                officeNumber: row.parliamentarian.officeNumber,
            },
            createdAt: row.createdAt,
        };
    }
}
