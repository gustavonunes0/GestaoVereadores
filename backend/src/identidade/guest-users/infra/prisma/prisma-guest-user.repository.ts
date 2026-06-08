import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '../../../../common/dto/pagination.dto';
import { paginatedQuery } from '../../../../common/prisma/paginate';
import { assertTenantScopedUpdate } from '../../../../common/prisma/tenant-scoped-update';
import { PrismaService } from '../../../../prisma/prisma.service';
import { GuestUserEntity } from '../../domain/entities/guest-user.entity';
import {
    GuestUserStatus,
    GuestUserType,
} from '../../domain/enums/guest-user.enums';
import {
    CreateGuestUserRepositoryInput,
    GuestUserRepository,
    ListGuestUsersRepositoryQuery,
    UpdateGuestUserRepositoryInput,
} from '../../domain/repositories/guest-user.repository';
import {
    GuestUserCreateInput,
    GuestUserPrismaAccessor,
    GuestUserRow,
    GuestUserWhereInput,
} from './guest-user.persistence';

@Injectable()
export class PrismaGuestUserRepository extends GuestUserRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    private get guestUserDb(): GuestUserPrismaAccessor['guestUser'] {
        return (this.prisma as unknown as GuestUserPrismaAccessor).guestUser;
    }

    async create(data: CreateGuestUserRepositoryInput): Promise<GuestUserEntity> {
        const row = await this.guestUserDb.create({
            data: this.toCreateData(data),
        });
        return this.toEntity(row);
    }

    async findMany(
        tenantId: string,
        query: ListGuestUsersRepositoryQuery,
    ): Promise<PaginatedResult<GuestUserEntity>> {
        const where = this.buildWhere(tenantId, query);
        return paginatedQuery<GuestUserEntity>(
            () => this.guestUserDb.count({ where }),
            (skip, take) =>
                this.guestUserDb
                    .findMany({
                        where,
                        orderBy: { createdAt: 'desc' },
                        skip,
                        take,
                    })
                    .then((rows) => rows.map((row) => this.toEntity(row))),
            { page: query.page, limit: query.limit },
        );
    }

    async findById(
        tenantId: string,
        id: string,
    ): Promise<GuestUserEntity | null> {
        const row = await this.guestUserDb.findFirst({
            where: { id, tenantId, isRemoved: false },
        });
        return row ? this.toEntity(row) : null;
    }

    async existsByCpf(
        tenantId: string,
        cpf: string,
        ignoreGuestUserId?: string,
    ): Promise<boolean> {
        const row = await this.guestUserDb.findFirst({
            where: {
                tenantId,
                cpf,
                isRemoved: false,
                ...(ignoreGuestUserId ? { NOT: { id: ignoreGuestUserId } } : {}),
            },
            select: { id: true },
        });
        return Boolean(row);
    }

    async findRemovedByCpf(
        tenantId: string,
        cpf: string,
    ): Promise<GuestUserEntity | null> {
        const row = await this.guestUserDb.findFirst({
            where: { tenantId, cpf, isRemoved: true },
        });
        return row ? this.toEntity(row) : null;
    }

    async reactivate(
        tenantId: string,
        id: string,
        data: CreateGuestUserRepositoryInput,
    ): Promise<GuestUserEntity> {
        const result = await this.guestUserDb.updateMany({
            where: { id, tenantId, isRemoved: true },
            data: {
                isRemoved: false,
                removedAt: null,
                ...this.toMutableData(data),
            },
        });
        assertTenantScopedUpdate(result.count, 'Convidado não encontrado');

        const row = await this.guestUserDb.findFirst({
            where: { id, tenantId, isRemoved: false },
        });
        if (!row) {
            throw new Error('Convidado não encontrado');
        }
        return this.toEntity(row);
    }

    async update(
        tenantId: string,
        id: string,
        data: UpdateGuestUserRepositoryInput,
    ): Promise<GuestUserEntity> {
        const result = await this.guestUserDb.updateMany({
            where: { id, tenantId, isRemoved: false },
            data: {
                ...(data.fullName !== undefined
                    ? { fullName: data.fullName }
                    : {}),
                ...(data.cpf !== undefined ? { cpf: data.cpf } : {}),
                ...(data.email !== undefined ? { email: data.email } : {}),
                ...(data.phone !== undefined ? { phone: data.phone } : {}),
                ...(data.type !== undefined ? { type: data.type } : {}),
                ...(data.status !== undefined ? { status: data.status } : {}),
                ...(data.organizationName !== undefined
                    ? { organizationName: data.organizationName }
                    : {}),
                ...(data.positionName !== undefined
                    ? { positionName: data.positionName }
                    : {}),
                ...(data.notes !== undefined ? { notes: data.notes } : {}),
            },
        });
        assertTenantScopedUpdate(result.count, 'Convidado não encontrado');

        const row = await this.guestUserDb.findFirst({
            where: { id, tenantId, isRemoved: false },
        });
        if (!row) {
            throw new Error('Convidado não encontrado');
        }
        return this.toEntity(row);
    }

    async softDelete(tenantId: string, id: string): Promise<void> {
        await this.guestUserDb.updateMany({
            where: { id, tenantId, isRemoved: false },
            data: { isRemoved: true, removedAt: new Date() },
        });
    }

    private buildWhere(
        tenantId: string,
        query: ListGuestUsersRepositoryQuery,
    ): GuestUserWhereInput {
        const where: GuestUserWhereInput = {
            tenantId,
            isRemoved: false,
        };
        if (query.type) where.type = query.type;
        if (query.status) where.status = query.status;
        if (query.search?.trim()) {
            where.fullName = {
                contains: query.search.trim(),
                mode: 'insensitive',
            };
        }
        return where;
    }

    private toCreateData(
        data: CreateGuestUserRepositoryInput,
    ): GuestUserCreateInput {
        return {
            tenantId: data.tenantId,
            ...this.toMutableData(data),
        };
    }

    private toMutableData(data: CreateGuestUserRepositoryInput) {
        return {
            fullName: data.fullName,
            cpf: data.cpf ?? null,
            email: data.email ?? null,
            phone: data.phone ?? null,
            type: data.type ?? GuestUserType.CITIZEN,
            status: data.status ?? GuestUserStatus.ACTIVE,
            organizationName: data.organizationName ?? null,
            positionName: data.positionName ?? null,
            notes: data.notes ?? null,
        };
    }

    private toEntity(row: GuestUserRow): GuestUserEntity {
        return GuestUserEntity.restore({
            id: row.id,
            tenantId: row.tenantId,
            fullName: row.fullName,
            cpf: row.cpf,
            email: row.email,
            phone: row.phone,
            type: row.type as GuestUserType,
            status: row.status as GuestUserStatus,
            organizationName: row.organizationName,
            positionName: row.positionName,
            notes: row.notes,
            isRemoved: row.isRemoved,
            removedAt: row.removedAt,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }
}
