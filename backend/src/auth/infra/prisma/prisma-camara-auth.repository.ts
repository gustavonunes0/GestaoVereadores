import { Injectable } from '@nestjs/common';
import { ParlamentarianUserStatus, TenantStatus, TenantUserStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CamaraUserEntity } from '../../domain/entities/camara-user.entity';
import {
    ParlamentarianUserAccessEntity,
    TenantUserAccessEntity,
} from '../../domain/entities/tenant-access.entity';
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
            cpf: row.cpf,
        });
    }

    async findUserByCpf(cpf: string): Promise<CamaraUserEntity | null> {
        const row = await this.prisma.user.findFirst({
            where: { cpf, isRemoved: false },
        });
        if (!row) return null;

        return new CamaraUserEntity({
            id: row.id,
            email: row.email,
            firstName: row.firstName,
            lastName: row.lastName,
            passwordHash: row.passwordHash,
            cpf: row.cpf,
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
                cpf: true,
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
            role: row.role,
        });
    }

    async findFirstActiveTenantUser(
        userId: string,
    ): Promise<TenantUserAccessEntity | null> {
        const row = await this.prisma.tenantUser.findFirst({
            where: {
                userId,
                isRemoved: false,
                status: TenantUserStatus.ACTIVE,
                tenant: { isRemoved: false, status: TenantStatus.ACTIVE },
            },
            orderBy: { createdAt: 'asc' },
        });
        if (!row) return null;

        return new TenantUserAccessEntity({
            id: row.id,
            tenantId: row.tenantId,
            userId: row.userId,
            role: row.role,
        });
    }

    async findActiveParlamentarianUser(
        userId: string,
        tenantId: string,
    ): Promise<ParlamentarianUserAccessEntity | null> {
        const row = await this.prisma.parlamentarianUser.findFirst({
            where: {
                userId,
                tenantId,
                isRemoved: false,
                status: ParlamentarianUserStatus.ACTIVE,
            },
            include: {
                parliamentarian: { select: { parliamentaryName: true } },
            },
        });
        if (!row) return null;

        return new ParlamentarianUserAccessEntity({
            id: row.id,
            tenantId: row.tenantId,
            userId: row.userId,
            parliamentarianId: row.parliamentarianId,
            parliamentaryName: row.parliamentarian.parliamentaryName,
        });
    }

    async findFirstActiveParlamentarianUser(
        userId: string,
    ): Promise<ParlamentarianUserAccessEntity | null> {
        const row = await this.prisma.parlamentarianUser.findFirst({
            where: {
                userId,
                isRemoved: false,
                status: ParlamentarianUserStatus.ACTIVE,
                tenant: { isRemoved: false, status: TenantStatus.ACTIVE },
            },
            include: {
                parliamentarian: { select: { parliamentaryName: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
        if (!row) return null;

        return new ParlamentarianUserAccessEntity({
            id: row.id,
            tenantId: row.tenantId,
            userId: row.userId,
            parliamentarianId: row.parliamentarianId,
            parliamentaryName: row.parliamentarian.parliamentaryName,
        });
    }

    async touchLastAccess(tenantUserId: string): Promise<void> {
        await this.prisma.tenantUser.update({
            where: { id: tenantUserId },
            data: { lastAccessAt: new Date() },
        });
    }

    async touchParlamentarianLastAccess(parliamentarianUserId: string): Promise<void> {
        await this.prisma.parlamentarianUser.update({
            where: { id: parliamentarianUserId },
            data: { lastAccessAt: new Date() },
        });
    }

    async isPartnerOnlyUser(userId: string): Promise<boolean> {
        const partnerUser = await this.prisma.tenantPartnerUser.findFirst({
            where: { userId, isRemoved: false },
        });
        if (!partnerUser) return false;

        const tenantUser = await this.prisma.tenantUser.findFirst({
            where: { userId, isRemoved: false },
        });
        if (tenantUser) return false;

        const parlUser = await this.prisma.parlamentarianUser.findFirst({
            where: { userId, isRemoved: false },
        });
        return !parlUser;
    }
}
