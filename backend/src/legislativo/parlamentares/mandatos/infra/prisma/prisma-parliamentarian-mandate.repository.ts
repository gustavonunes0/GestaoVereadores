import { Injectable } from '@nestjs/common';
import {
    ParliamentarianMandate as PrismaParliamentarianMandate,
    Prisma,
} from '@prisma/client';
import { paginatedQuery } from '../../../../../common/prisma/paginate';
import { assertTenantScopedUpdate } from '../../../../../common/prisma/tenant-scoped-update';
import { tenantWhere } from '../../../../../common/prisma/tenant-scope';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { ParliamentarianMandateEntity } from '../../domain/entities/parliamentarian-mandate.entity';
import { MandateStatus } from '../../domain/enums/mandate-status.enum';
import {
    CreateParliamentarianMandateRepositoryInput,
    ListParliamentarianMandatesRepositoryQuery,
    ParliamentarianMandateRepository,
    ParliamentarianMandateWithLegislature,
    UpdateParliamentarianMandateRepositoryInput,
} from '../../domain/repositories/parliamentarian-mandate.repository';

const mandateInclude = {
    legislature: {
        select: {
            id: true,
            number: true,
            startDate: true,
            endDate: true,
            isCurrent: true,
        },
    },
} satisfies Prisma.ParliamentarianMandateInclude;

type MandateRow = PrismaParliamentarianMandate & {
    legislature: {
        id: string;
        number: number;
        startDate: Date;
        endDate: Date | null;
        isCurrent: boolean;
    };
};

@Injectable()
export class PrismaParliamentarianMandateRepository extends ParliamentarianMandateRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async create(data: CreateParliamentarianMandateRepositoryInput) {
        const mandate = ParliamentarianMandateEntity.create(data);
        const p = mandate.toPrimitives();
        const row = await this.prisma.parliamentarianMandate.create({
            data: {
                id: p.id,
                tenantId: p.tenantId,
                parliamentarianId: p.parliamentarianId,
                legislatureId: p.legislatureId,
                partyAcronym: p.partyAcronym,
                partyName: p.partyName,
                startedAt: p.startedAt,
                status: p.status,
            },
            include: mandateInclude,
        });
        return this.toWithLegislature(row);
    }

    async findMany(
        tenantId: string,
        parliamentarianId: string,
        query: ListParliamentarianMandatesRepositoryQuery,
    ) {
        const where: Prisma.ParliamentarianMandateWhereInput = {
            ...tenantWhere(tenantId),
            parliamentarianId,
            isRemoved: false,
        };
        if (query.status) where.status = query.status;
        if (query.legislatureId) where.legislatureId = query.legislatureId;

        return paginatedQuery(
            () => this.prisma.parliamentarianMandate.count({ where }),
            (skip, take) =>
                this.prisma.parliamentarianMandate.findMany({
                    where,
                    include: mandateInclude,
                    orderBy: [{ startedAt: 'desc' }, { createdAt: 'desc' }],
                    skip,
                    take,
                }),
            query,
        ).then((result) => ({
            ...result,
            data: result.data.map((row) => this.toWithLegislature(row)),
        }));
    }

    async findById(tenantId: string, id: string) {
        const row = await this.prisma.parliamentarianMandate.findFirst({
            where: { id, ...tenantWhere(tenantId), isRemoved: false },
            include: mandateInclude,
        });
        return row ? this.toWithLegislature(row) : null;
    }

    async findByParliamentarianAndLegislature(
        tenantId: string,
        parliamentarianId: string,
        legislatureId: string,
    ) {
        const row = await this.prisma.parliamentarianMandate.findFirst({
            where: {
                ...tenantWhere(tenantId),
                parliamentarianId,
                legislatureId,
            },
            include: mandateInclude,
        });
        return row ? this.toWithLegislature(row) : null;
    }

    async update(
        tenantId: string,
        id: string,
        data: UpdateParliamentarianMandateRepositoryInput,
    ) {
        const result = await this.prisma.parliamentarianMandate.updateMany({
            where: { id, tenantId, isRemoved: false },
            data: {
                ...(data.partyAcronym !== undefined
                    ? { partyAcronym: data.partyAcronym }
                    : {}),
                ...(data.partyName !== undefined
                    ? { partyName: data.partyName }
                    : {}),
                ...(data.startedAt !== undefined
                    ? { startedAt: data.startedAt }
                    : {}),
                ...(data.endedAt !== undefined ? { endedAt: data.endedAt } : {}),
                ...(data.status !== undefined ? { status: data.status } : {}),
                ...(data.isRemoved !== undefined
                    ? { isRemoved: data.isRemoved }
                    : {}),
                ...(data.removedAt !== undefined
                    ? { removedAt: data.removedAt }
                    : {}),
            },
        });
        assertTenantScopedUpdate(result.count, 'Mandato não encontrado');

        const row = await this.prisma.parliamentarianMandate.findFirst({
            where: { id, tenantId, isRemoved: false },
            include: mandateInclude,
        });
        if (!row) throw new Error('Mandato não encontrado');
        return this.toWithLegislature(row);
    }

    async hasActiveMandate(
        tenantId: string,
        parliamentarianId: string,
        legislatureId: string,
    ) {
        const count = await this.prisma.parliamentarianMandate.count({
            where: {
                ...tenantWhere(tenantId),
                parliamentarianId,
                legislatureId,
                isRemoved: false,
                status: MandateStatus.ACTIVE,
            },
        });
        return count > 0;
    }

    private toWithLegislature(
        row: MandateRow,
    ): ParliamentarianMandateWithLegislature {
        return {
            entity: ParliamentarianMandateEntity.restore({
                id: row.id,
                tenantId: row.tenantId,
                parliamentarianId: row.parliamentarianId,
                legislatureId: row.legislatureId,
                partyAcronym: row.partyAcronym,
                partyName: row.partyName,
                startedAt: row.startedAt,
                endedAt: row.endedAt,
                status: row.status as MandateStatus,
                isRemoved: row.isRemoved,
                removedAt: row.removedAt,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
            }),
            legislature: {
                id: row.legislature.id,
                number: row.legislature.number,
                startDate: row.legislature.startDate,
                endDate: row.legislature.endDate,
                isCurrent: row.legislature.isCurrent,
            },
        };
    }
}
