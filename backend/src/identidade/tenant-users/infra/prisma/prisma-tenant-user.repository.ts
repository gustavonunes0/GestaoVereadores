import { Injectable } from '@nestjs/common';
import { Prisma, TenantUser } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
    TenantUserEntity,
    TenantUserPrimitives,
    TenantUserStatus,
} from '../../domain/entities/tenant-user.entity';
import { TenantUserRepository } from '../../domain/repositories/tenant-user.repository';

@Injectable()
export class PrismaTenantUserRepository implements TenantUserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(tenantUser: TenantUserEntity): Promise<TenantUserEntity> {
        const data = tenantUser.toPrimitives();
        const createdTenantUser = await this.prisma.tenantUser.create({
            data: this.toCreateInput(data),
        });

        return this.toEntity(createdTenantUser);
    }

    async findAll(filters?: {
        tenantId?: string;
        userId?: string;
    }): Promise<TenantUserEntity[]> {
        const tenantUsers = await this.prisma.tenantUser.findMany({
            where: {
                isRemoved: false,
                tenantId: filters?.tenantId,
                userId: filters?.userId,
            },
            orderBy: { createdAt: 'desc' },
        });

        return tenantUsers.map((tenantUser) => this.toEntity(tenantUser));
    }

    async findById(id: string): Promise<TenantUserEntity | null> {
        const tenantUser = await this.prisma.tenantUser.findFirst({
            where: { id, isRemoved: false },
        });

        return tenantUser ? this.toEntity(tenantUser) : null;
    }

    async findByIdForTenant(
        tenantId: string,
        id: string,
    ): Promise<TenantUserEntity | null> {
        const tenantUser = await this.prisma.tenantUser.findFirst({
            where: { id, tenantId, isRemoved: false },
        });

        return tenantUser ? this.toEntity(tenantUser) : null;
    }

    async findByTenantAndUser(
        tenantId: string,
        userId: string,
    ): Promise<TenantUserEntity | null> {
        const tenantUser = await this.prisma.tenantUser.findFirst({
            where: { tenantId, userId, isRemoved: false },
        });

        return tenantUser ? this.toEntity(tenantUser) : null;
    }

    async update(tenantUser: TenantUserEntity): Promise<TenantUserEntity> {
        const data = tenantUser.toPrimitives();
        const updatedTenantUser = await this.prisma.tenantUser.update({
            where: { id: data.id },
            data: this.toUpdateInput(data),
        });

        return this.toEntity(updatedTenantUser);
    }

    async remove(id: string): Promise<void> {
        await this.prisma.tenantUser.update({
            where: { id },
            data: {
                isRemoved: true,
                removedAt: new Date(),
            },
        });
    }

    private toEntity(tenantUser: TenantUser) {
        return TenantUserEntity.restore({
            id: tenantUser.id,
            tenantId: tenantUser.tenantId,
            userId: tenantUser.userId,
            isTenantAdmin: tenantUser.isTenantAdmin,
            isTenantStaff: tenantUser.isTenantStaff,
            isParliamentarian: tenantUser.isParliamentarian,
            status: tenantUser.status as TenantUserStatus,
            permissions: this.normalizePermissions(tenantUser.permissions),
            lastAccessAt: tenantUser.lastAccessAt,
            removedAt: tenantUser.removedAt,
            createdAt: tenantUser.createdAt,
            createdBy: tenantUser.createdBy,
            modifiedAt: tenantUser.modifiedAt,
            modifiedBy: tenantUser.modifiedBy,
            isRemoved: tenantUser.isRemoved,
        });
    }

    private toCreateInput(
        tenantUser: TenantUserPrimitives,
    ): Prisma.TenantUserUncheckedCreateInput {
        return {
            id: tenantUser.id,
            tenantId: tenantUser.tenantId,
            userId: tenantUser.userId,
            isTenantAdmin: tenantUser.isTenantAdmin,
            isTenantStaff: tenantUser.isTenantStaff,
            isParliamentarian: tenantUser.isParliamentarian,
            status: tenantUser.status,
            permissions: tenantUser.permissions as Prisma.InputJsonValue,
            lastAccessAt: tenantUser.lastAccessAt,
            createdAt: tenantUser.createdAt,
            createdBy: tenantUser.createdBy,
            modifiedAt: tenantUser.modifiedAt,
            modifiedBy: tenantUser.modifiedBy,
            isRemoved: tenantUser.isRemoved,
            removedAt: tenantUser.removedAt,
        };
    }

    private toUpdateInput(
        tenantUser: TenantUserPrimitives,
    ): Prisma.TenantUserUncheckedUpdateInput {
        return {
            isTenantAdmin: tenantUser.isTenantAdmin,
            isTenantStaff: tenantUser.isTenantStaff,
            isParliamentarian: tenantUser.isParliamentarian,
            status: tenantUser.status,
            permissions: tenantUser.permissions as Prisma.InputJsonValue,
            lastAccessAt: tenantUser.lastAccessAt,
            createdBy: tenantUser.createdBy,
            modifiedBy: tenantUser.modifiedBy,
            isRemoved: tenantUser.isRemoved,
            removedAt: tenantUser.removedAt,
        };
    }

    private normalizePermissions(
        permissions: Prisma.JsonValue | null,
    ): string[] {
        if (!Array.isArray(permissions)) {
            return [];
        }

        return permissions.filter((permission): permission is string => {
            return typeof permission === 'string';
        });
    }
}
