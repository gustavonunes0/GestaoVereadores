import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { paginatedQuery } from '../../../../common/prisma/paginate';
import { assertTenantScopedUpdate } from '../../../../common/prisma/tenant-scoped-update';
import { tenantWhere } from '../../../../common/prisma/tenant-scope';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ParliamentaryFrontEntity } from '../../domain/entities/parliamentary-front.entity';
import { ParliamentaryFrontStatus } from '../../domain/enums/parliamentary-front-status.enum';
import {
    AddParliamentaryFrontMemberRepositoryInput,
    CreateParliamentaryFrontRepositoryInput,
    ListParliamentaryFrontsRepositoryQuery,
    ParliamentaryFrontMemberWithRelations,
    ParliamentaryFrontRepository,
    ParliamentaryFrontWithRelations,
    UpdateParliamentaryFrontRepositoryInput,
} from '../../domain/repositories/parliamentary-front.repository';

const parliamentarianSelect = {
    id: true,
    parliamentaryName: true,
    officeNumber: true,
    politicalParty: {
        select: { id: true, name: true, acronym: true },
    },
} satisfies Prisma.ParliamentarianSelect;

const frontInclude = {
    coordinator: { select: parliamentarianSelect },
    createdBy: { select: { id: true, userId: true } },
    members: {
        where: { isRemoved: false },
        orderBy: { createdAt: 'asc' as const },
        include: {
            parliamentarian: { select: parliamentarianSelect },
        },
    },
} satisfies Prisma.ParliamentaryFrontInclude;

type FrontRow = Prisma.ParliamentaryFrontGetPayload<{
    include: typeof frontInclude;
}>;

@Injectable()
export class PrismaParliamentaryFrontRepository extends ParliamentaryFrontRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async create(data: CreateParliamentaryFrontRepositoryInput) {
        const front = ParliamentaryFrontEntity.create(data);
        const p = front.toPrimitives();
        const row = await this.prisma.parliamentaryFront.create({
            data: {
                id: p.id,
                tenantId: p.tenantId,
                name: p.name,
                theme: p.theme,
                description: p.description,
                startDate: p.startDate,
                endDate: p.endDate,
                status: p.status,
                coordinatorParliamentarianId: p.coordinatorParliamentarianId,
                createdByTenantUserId: p.createdByTenantUserId,
            },
            include: frontInclude,
        });
        return this.toWithRelations(row);
    }

    async findMany(
        tenantId: string,
        query: ListParliamentaryFrontsRepositoryQuery,
    ) {
        const where: Prisma.ParliamentaryFrontWhereInput = {
            ...tenantWhere(tenantId),
            isRemoved: false,
        };
        if (query.status) where.status = query.status;
        if (query.theme?.trim()) {
            where.theme = {
                contains: query.theme.trim(),
                mode: 'insensitive',
            };
        }
        if (query.search?.trim()) {
            where.OR = [
                {
                    name: {
                        contains: query.search.trim(),
                        mode: 'insensitive',
                    },
                },
                {
                    theme: {
                        contains: query.search.trim(),
                        mode: 'insensitive',
                    },
                },
            ];
        }

        return paginatedQuery(
            () => this.prisma.parliamentaryFront.count({ where }),
            (skip, take) =>
                this.prisma.parliamentaryFront.findMany({
                    where,
                    include: frontInclude,
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
        const row = await this.prisma.parliamentaryFront.findFirst({
            where: { id, ...tenantWhere(tenantId), isRemoved: false },
            include: frontInclude,
        });
        return row ? this.toWithRelations(row) : null;
    }

    async update(
        tenantId: string,
        id: string,
        data: UpdateParliamentaryFrontRepositoryInput,
    ) {
        const existing = await this.findById(tenantId, id);
        if (!existing) throw new Error('Frente parlamentar não encontrada');

        existing.entity.update(data);
        const p = existing.entity.toPrimitives();

        const result = await this.prisma.parliamentaryFront.updateMany({
            where: { id, tenantId, isRemoved: false },
            data: {
                name: p.name,
                theme: p.theme,
                description: p.description,
                startDate: p.startDate,
                endDate: p.endDate,
                status: p.status,
                coordinatorParliamentarianId: p.coordinatorParliamentarianId,
            },
        });
        assertTenantScopedUpdate(
            result.count,
            'Frente parlamentar não encontrada',
        );

        const row = await this.prisma.parliamentaryFront.findFirst({
            where: { id, tenantId, isRemoved: false },
            include: frontInclude,
        });
        if (!row) throw new Error('Frente parlamentar não encontrada');
        return this.toWithRelations(row);
    }

    async softDelete(tenantId: string, id: string) {
        const result = await this.prisma.parliamentaryFront.updateMany({
            where: { id, tenantId, isRemoved: false },
            data: {
                isRemoved: true,
                removedAt: new Date(),
                status: ParliamentaryFrontStatus.FINISHED,
            },
        });
        assertTenantScopedUpdate(
            result.count,
            'Frente parlamentar não encontrada',
        );
    }

    async existsMemberByParliamentarian(
        tenantId: string,
        frontId: string,
        parliamentarianId: string,
    ) {
        const count = await this.prisma.parliamentaryFrontMember.count({
            where: {
                ...tenantWhere(tenantId),
                frontId,
                parliamentarianId,
                isRemoved: false,
            },
        });
        return count > 0;
    }

    async addMember(data: AddParliamentaryFrontMemberRepositoryInput) {
        const row = await this.prisma.parliamentaryFrontMember.create({
            data: {
                tenantId: data.tenantId,
                frontId: data.frontId,
                parliamentarianId: data.parliamentarianId,
            },
            include: {
                parliamentarian: { select: parliamentarianSelect },
            },
        });
        return this.toMember(row);
    }

    async removeMember(tenantId: string, frontId: string, memberId: string) {
        const result = await this.prisma.parliamentaryFrontMember.updateMany({
            where: {
                id: memberId,
                frontId,
                ...tenantWhere(tenantId),
                isRemoved: false,
            },
            data: { isRemoved: true, removedAt: new Date() },
        });
        assertTenantScopedUpdate(
            result.count,
            'Membro não encontrado nesta frente parlamentar',
        );
    }

    private toWithRelations(row: FrontRow): ParliamentaryFrontWithRelations {
        return {
            entity: ParliamentaryFrontEntity.restore({
                id: row.id,
                tenantId: row.tenantId,
                name: row.name,
                theme: row.theme,
                description: row.description,
                startDate: row.startDate,
                endDate: row.endDate,
                status: row.status as ParliamentaryFrontStatus,
                coordinatorParliamentarianId: row.coordinatorParliamentarianId,
                createdByTenantUserId: row.createdByTenantUserId,
                isRemoved: row.isRemoved,
                removedAt: row.removedAt,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
            }),
            coordinator: row.coordinator
                ? this.toParliamentarianSummary(row.coordinator)
                : null,
            createdBy: row.createdBy,
            members: row.members.map((member) => this.toMember(member)),
        };
    }

    private toParliamentarianSummary(
        row: Prisma.ParliamentarianGetPayload<{
            select: typeof parliamentarianSelect;
        }>,
    ) {
        return {
            id: row.id,
            parliamentaryName: row.parliamentaryName,
            officeNumber: row.officeNumber,
            politicalParty: row.politicalParty,
        };
    }

    private toMember(
        row: Prisma.ParliamentaryFrontMemberGetPayload<{
            include: { parliamentarian: { select: typeof parliamentarianSelect } };
        }>,
    ): ParliamentaryFrontMemberWithRelations {
        return {
            id: row.id,
            parliamentarian: this.toParliamentarianSummary(row.parliamentarian),
            createdAt: row.createdAt,
        };
    }
}
