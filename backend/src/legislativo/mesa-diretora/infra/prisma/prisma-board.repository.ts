import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { paginatedQuery } from '../../../../common/prisma/paginate';
import { assertTenantScopedUpdate } from '../../../../common/prisma/tenant-scoped-update';
import { tenantWhere } from '../../../../common/prisma/tenant-scope';
import { PrismaService } from '../../../../prisma/prisma.service';
import { BoardEntity } from '../../domain/entities/board.entity';
import { BoardRoleEntity } from '../../domain/entities/board-role.entity';
import { DEFAULT_BOARD_ROLE_NAMES } from '../../domain/constants/default-board-roles.constants';
import { BoardStatus } from '../../domain/enums/board-status.enum';
import {
    AddBoardMemberRepositoryInput,
    BoardMemberWithRelations,
    BoardRepository,
    BoardWithRelations,
    CreateBoardRepositoryInput,
    CreateBoardRoleRepositoryInput,
    ListBoardsRepositoryQuery,
    UpdateBoardRepositoryInput,
} from '../../domain/repositories/board.repository';

const legislatureSelect = {
    id: true,
    number: true,
    startDate: true,
    endDate: true,
    isCurrent: true,
} satisfies Prisma.LegislatureSelect;

const boardInclude = {
    legislature: { select: legislatureSelect },
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
            boardRole: {
                select: { id: true, name: true },
            },
        },
    },
} satisfies Prisma.BoardInclude;

type BoardRow = Prisma.BoardGetPayload<{ include: typeof boardInclude }>;

@Injectable()
export class PrismaBoardRepository extends BoardRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async create(data: CreateBoardRepositoryInput) {
        const board = BoardEntity.create(data);
        const p = board.toPrimitives();
        const row = await this.prisma.board.create({
            data: {
                id: p.id,
                tenantId: p.tenantId,
                legislatureId: p.legislatureId,
                name: p.name,
                startDate: p.startDate,
                endDate: p.endDate,
                status: p.status,
                notes: p.notes,
            },
            include: boardInclude,
        });
        return this.toWithRelations(row);
    }

    async findMany(tenantId: string, query: ListBoardsRepositoryQuery) {
        const where: Prisma.BoardWhereInput = {
            ...tenantWhere(tenantId),
            isRemoved: false,
        };
        if (query.legislatureId) where.legislatureId = query.legislatureId;
        if (query.status) where.status = query.status;

        return paginatedQuery(
            () => this.prisma.board.count({ where }),
            (skip, take) =>
                this.prisma.board.findMany({
                    where,
                    include: boardInclude,
                    orderBy: { startDate: 'desc' },
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
        const row = await this.prisma.board.findFirst({
            where: { id, ...tenantWhere(tenantId), isRemoved: false },
            include: boardInclude,
        });
        return row ? this.toWithRelations(row) : null;
    }

    async update(
        tenantId: string,
        id: string,
        data: UpdateBoardRepositoryInput,
    ) {
        const result = await this.prisma.board.updateMany({
            where: { id, tenantId, isRemoved: false },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.startDate !== undefined
                    ? { startDate: data.startDate }
                    : {}),
                ...(data.endDate !== undefined ? { endDate: data.endDate } : {}),
                ...(data.status !== undefined ? { status: data.status } : {}),
                ...(data.notes !== undefined ? { notes: data.notes } : {}),
            },
        });
        assertTenantScopedUpdate(result.count, 'Mesa diretora não encontrada');

        const row = await this.prisma.board.findFirst({
            where: { id, tenantId, isRemoved: false },
            include: boardInclude,
        });
        if (!row) throw new Error('Mesa diretora não encontrada');
        return this.toWithRelations(row);
    }

    async softDelete(tenantId: string, id: string) {
        await this.prisma.board.updateMany({
            where: { id, tenantId, isRemoved: false },
            data: {
                isRemoved: true,
                removedAt: new Date(),
                status: BoardStatus.FINISHED,
            },
        });
    }

    async existsMemberByRole(
        tenantId: string,
        boardId: string,
        boardRoleId: string,
    ) {
        const count = await this.prisma.boardMember.count({
            where: {
                ...tenantWhere(tenantId),
                boardId,
                boardRoleId,
                isRemoved: false,
            },
        });
        return count > 0;
    }

    async existsMemberByParliamentarian(
        tenantId: string,
        boardId: string,
        parliamentarianId: string,
    ) {
        const count = await this.prisma.boardMember.count({
            where: {
                ...tenantWhere(tenantId),
                boardId,
                parliamentarianId,
                isRemoved: false,
            },
        });
        return count > 0;
    }

    async addMember(data: AddBoardMemberRepositoryInput) {
        const row = await this.prisma.boardMember.create({
            data: {
                tenantId: data.tenantId,
                boardId: data.boardId,
                parliamentarianId: data.parliamentarianId,
                boardRoleId: data.boardRoleId,
            },
            include: {
                parliamentarian: {
                    select: {
                        id: true,
                        parliamentaryName: true,
                        officeNumber: true,
                    },
                },
                boardRole: { select: { id: true, name: true } },
            },
        });
        return this.toMember(row);
    }

    async removeMember(tenantId: string, boardId: string, memberId: string) {
        const result = await this.prisma.boardMember.updateMany({
            where: {
                id: memberId,
                boardId,
                ...tenantWhere(tenantId),
                isRemoved: false,
            },
            data: { isRemoved: true, removedAt: new Date() },
        });
        assertTenantScopedUpdate(
            result.count,
            'Membro não encontrado nesta mesa diretora',
        );
    }

    async createRole(data: CreateBoardRoleRepositoryInput) {
        const role = BoardRoleEntity.create(data);
        const p = role.toPrimitives();
        const row = await this.prisma.boardRole.create({
            data: {
                id: p.id,
                tenantId: p.tenantId,
                name: p.name,
            },
        });
        return BoardRoleEntity.restore(row);
    }

    async findRoles(tenantId: string) {
        const rows = await this.prisma.boardRole.findMany({
            where: { tenantId, isRemoved: false },
            orderBy: { name: 'asc' },
        });
        return rows.map((row) => BoardRoleEntity.restore(row));
    }

    async findRoleById(tenantId: string, id: string) {
        const row = await this.prisma.boardRole.findFirst({
            where: { id, tenantId, isRemoved: false },
        });
        return row ? BoardRoleEntity.restore(row) : null;
    }

    async existsRoleByName(tenantId: string, name: string) {
        const row = await this.prisma.boardRole.findFirst({
            where: {
                tenantId,
                name: { equals: name.trim(), mode: 'insensitive' },
                isRemoved: false,
            },
            select: { id: true },
        });
        return Boolean(row);
    }

    async ensureDefaultRoles(tenantId: string) {
        for (const name of DEFAULT_BOARD_ROLE_NAMES) {
            await this.prisma.boardRole.upsert({
                where: {
                    tenantId_name: { tenantId, name },
                },
                update: { isRemoved: false, removedAt: null },
                create: { tenantId, name },
            });
        }
    }

    private toWithRelations(row: BoardRow): BoardWithRelations {
        return {
            entity: BoardEntity.restore({
                id: row.id,
                tenantId: row.tenantId,
                legislatureId: row.legislatureId,
                name: row.name,
                startDate: row.startDate,
                endDate: row.endDate,
                status: row.status as BoardStatus,
                notes: row.notes,
                isRemoved: row.isRemoved,
                removedAt: row.removedAt,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
            }),
            legislature: row.legislature,
            members: row.members.map((member) => this.toMember(member)),
        };
    }

    private toMember(
        row: Prisma.BoardMemberGetPayload<{
            include: {
                parliamentarian: {
                    select: {
                        id: true;
                        parliamentaryName: true;
                        officeNumber: true;
                    };
                };
                boardRole: { select: { id: true; name: true } };
            };
        }>,
    ): BoardMemberWithRelations {
        return {
            id: row.id,
            parliamentarian: {
                id: row.parliamentarian.id,
                parliamentaryName: row.parliamentarian.parliamentaryName,
                officeNumber: row.parliamentarian.officeNumber,
            },
            boardRole: row.boardRole,
            createdAt: row.createdAt,
        };
    }
}
