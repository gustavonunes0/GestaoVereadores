import { Injectable } from '@nestjs/common';
import { TenantUserStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CamaraUserEntity } from '../../domain/entities/camara-user.entity';
import { TenantUserAccessEntity } from '../../domain/entities/tenant-access.entity';
import {
    CamaraAuthRepository,
    CamaraUserProfile,
} from '../../domain/repositories/camara-auth.repository';

@Injectable()
export class PrismaCamaraAuthRepository extends CamaraAuthRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async findUserByEmail(email: string): Promise<CamaraUserEntity | null> {
        const row = await this.prisma.user.findFirst({
            where: { email, isRemoved: false },
        });
        if (!row) return null;

        return new CamaraUserEntity({
            id: row.id,
            email: row.email,
            firstName: row.firstName,
            lastName: row.lastName,
            passwordHash: row.passwordHash,
        });
    }

    async findProfileById(id: string): Promise<CamaraUserProfile | null> {
        return this.prisma.user.findFirst({
            where: { id, isRemoved: false },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },
        });
    }

    async findActiveTenantUser(
        userId: string,
        tenantId: string,
    ): Promise<TenantUserAccessEntity | null> {
        const row = await this.prisma.tenantUser.findFirst({
            where: {
                userId,
                tenantId,
                isRemoved: false,
                status: TenantUserStatus.ACTIVE,
            },
        });
        if (!row) return null;

        return new TenantUserAccessEntity({
            id: row.id,
            tenantId: row.tenantId,
            userId: row.userId,
            isTenantAdmin: row.isTenantAdmin,
            isTenantStaff: row.isTenantStaff,
            isParliamentarian: row.isParliamentarian,
        });
    }

    async touchLastAccess(tenantUserId: string): Promise<void> {
        await this.prisma.tenantUser.update({
            where: { id: tenantUserId },
            data: { lastAccessAt: new Date() },
        });
    }
}
