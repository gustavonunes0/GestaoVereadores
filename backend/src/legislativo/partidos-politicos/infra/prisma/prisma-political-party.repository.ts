import { Injectable } from '@nestjs/common';
import { PoliticalParty as PrismaPoliticalParty, Prisma } from '@prisma/client';
import { paginatedQuery } from '../../../../common/prisma/paginate';
import { assertTenantScopedUpdate } from '../../../../common/prisma/tenant-scoped-update';
import { PrismaService } from '../../../../prisma/prisma.service';
import { PoliticalPartyEntity } from '../../domain/entities/political-party.entity';
import {
    CreatePoliticalPartyRepositoryInput,
    ListPoliticalPartiesRepositoryQuery,
    PoliticalPartyRepository,
    UpdatePoliticalPartyRepositoryInput,
} from '../../domain/repositories/political-party.repository';

@Injectable()
export class PrismaPoliticalPartyRepository extends PoliticalPartyRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async create(data: CreatePoliticalPartyRepositoryInput) {
        const row = await this.prisma.politicalParty.create({
            data: {
                tenantId: data.tenantId,
                name: data.name,
                acronym: data.acronym,
                ideology: data.ideology ?? null,
                flagUrl: data.flagUrl ?? null,
            },
        });
        return this.toEntity(row);
    }

    async findMany(tenantId: string, query: ListPoliticalPartiesRepositoryQuery) {
        const where: Prisma.PoliticalPartyWhereInput = {
            tenantId,
            isRemoved: false,
        };
        if (query.search?.trim()) {
            const term = query.search.trim();
            where.OR = [
                { name: { contains: term, mode: 'insensitive' } },
                { acronym: { contains: term, mode: 'insensitive' } },
                { ideology: { contains: term, mode: 'insensitive' } },
            ];
        }
        return paginatedQuery(
            () => this.prisma.politicalParty.count({ where }),
            (skip, take) =>
                this.prisma.politicalParty
                    .findMany({
                        where,
                        orderBy: { name: 'asc' },
                        skip,
                        take,
                    })
                    .then((rows) => rows.map((r) => this.toEntity(r))),
            { page: query.page, limit: query.limit },
        );
    }

    async findById(tenantId: string, id: string) {
        const row = await this.prisma.politicalParty.findFirst({
            where: { id, tenantId, isRemoved: false },
        });
        return row ? this.toEntity(row) : null;
    }

    async findAnyById(tenantId: string, id: string) {
        const row = await this.prisma.politicalParty.findFirst({
            where: { id, tenantId },
        });
        return row ? this.toEntity(row) : null;
    }

    async existsByAcronym(tenantId: string, acronym: string, ignoreId?: string) {
        const row = await this.prisma.politicalParty.findFirst({
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

    async existsByName(tenantId: string, name: string, ignoreId?: string) {
        const row = await this.prisma.politicalParty.findFirst({
            where: {
                tenantId,
                name: { equals: name.trim(), mode: 'insensitive' },
                isRemoved: false,
                ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
            },
            select: { id: true },
        });
        return Boolean(row);
    }

    async findRemovedByAcronym(tenantId: string, acronym: string) {
        const row = await this.prisma.politicalParty.findFirst({
            where: {
                tenantId,
                acronym: acronym.trim().toUpperCase(),
                isRemoved: true,
            },
        });
        return row ? this.toEntity(row) : null;
    }

    async reactivate(
        tenantId: string,
        id: string,
        data: CreatePoliticalPartyRepositoryInput,
    ) {
        const result = await this.prisma.politicalParty.updateMany({
            where: { id, tenantId, isRemoved: true },
            data: {
                isRemoved: false,
                removedAt: null,
                name: data.name,
                acronym: data.acronym,
                ideology: data.ideology ?? null,
                flagUrl: data.flagUrl ?? null,
            },
        });
        assertTenantScopedUpdate(result.count, 'Partido político não encontrado');

        const row = await this.prisma.politicalParty.findFirst({
            where: { id, tenantId, isRemoved: false },
        });
        if (!row) {
            throw new Error('Partido político não encontrado');
        }
        return this.toEntity(row);
    }

    async update(
        tenantId: string,
        id: string,
        data: UpdatePoliticalPartyRepositoryInput,
    ) {
        const result = await this.prisma.politicalParty.updateMany({
            where: { id, tenantId, isRemoved: false },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.acronym !== undefined ? { acronym: data.acronym } : {}),
                ...(data.ideology !== undefined
                    ? { ideology: data.ideology }
                    : {}),
                ...(data.flagUrl !== undefined ? { flagUrl: data.flagUrl } : {}),
            },
        });
        assertTenantScopedUpdate(result.count, 'Partido político não encontrado');

        const row = await this.prisma.politicalParty.findFirst({
            where: { id, tenantId, isRemoved: false },
        });
        if (!row) {
            throw new Error('Partido político não encontrado');
        }
        return this.toEntity(row);
    }

    async softDelete(tenantId: string, id: string) {
        await this.prisma.politicalParty.updateMany({
            where: { id, tenantId, isRemoved: false },
            data: { isRemoved: true, removedAt: new Date() },
        });
    }

    async countActiveParliamentarians(
        tenantId: string,
        politicalPartyId: string,
    ) {
        return this.prisma.parlamentarianUser.count({
            where: {
                tenantId,
                politicalPartyId,
                isRemoved: false,
                status: 'ACTIVE',
                parliamentarian: {
                    isRemoved: false,
                    status: 'ACTIVE',
                },
            },
        });
    }

    private toEntity(row: PrismaPoliticalParty) {
        return PoliticalPartyEntity.restore({
            id: row.id,
            tenantId: row.tenantId,
            name: row.name,
            acronym: row.acronym,
            ideology: row.ideology,
            flagUrl: row.flagUrl,
            isRemoved: row.isRemoved,
            removedAt: row.removedAt,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }
}
