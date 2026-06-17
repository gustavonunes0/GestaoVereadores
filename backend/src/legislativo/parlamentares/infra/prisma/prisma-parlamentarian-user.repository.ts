import { Injectable } from '@nestjs/common';
import { ParlamentarianUserStatus as PrismaStatus } from '@prisma/client';
import { assertTenantScopedUpdate } from '../../../../common/prisma/tenant-scoped-update';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ParlamentarianUserEntity } from '../../domain/entities/parlamentarian-user.entity';
import { ParlamentarianUserStatus } from '../../domain/enums/parlamentarian-user-status.enum';
import { ParlamentarianUserRepository } from '../../domain/repositories/parlamentarian-user.repository';

@Injectable()
export class PrismaParlamentarianUserRepository extends ParlamentarianUserRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async create(entity: ParlamentarianUserEntity) {
        const p = entity.toPrimitives();
        const row = await this.prisma.parlamentarianUser.create({
            data: {
                id: p.id,
                tenantId: p.tenantId,
                parliamentarianId: p.parliamentarianId,
                userId: p.userId,
                status: p.status as PrismaStatus,
            },
        });
        return this.toEntity(row);
    }

    async findActiveByParliamentarianId(
        tenantId: string,
        parliamentarianId: string,
    ) {
        const row = await this.prisma.parlamentarianUser.findFirst({
            where: {
                tenantId,
                parliamentarianId,
                isRemoved: false,
                status: PrismaStatus.ACTIVE,
            },
        });
        return row ? this.toEntity(row) : null;
    }

    async findActiveByUserId(tenantId: string, userId: string) {
        const row = await this.prisma.parlamentarianUser.findFirst({
            where: {
                tenantId,
                userId,
                isRemoved: false,
                status: PrismaStatus.ACTIVE,
            },
        });
        return row ? this.toEntity(row) : null;
    }

    async deactivate(tenantId: string, parliamentarianId: string) {
        const result = await this.prisma.parlamentarianUser.updateMany({
            where: {
                tenantId,
                parliamentarianId,
                isRemoved: false,
                status: PrismaStatus.ACTIVE,
            },
            data: { status: PrismaStatus.INACTIVE },
        });
        assertTenantScopedUpdate(
            result.count,
            'Parlamentar não possui acesso ativo',
        );

        const row = await this.prisma.parlamentarianUser.findFirst({
            where: { tenantId, parliamentarianId, isRemoved: false },
            orderBy: { updatedAt: 'desc' },
        });
        if (!row) {
            throw new Error('Parlamentar não possui acesso ativo');
        }
        return this.toEntity(row);
    }

    private toEntity(row: {
        id: string;
        tenantId: string;
        parliamentarianId: string;
        userId: string;
        status: PrismaStatus;
        lastAccessAt: Date | null;
        isRemoved: boolean;
        removedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }) {
        return ParlamentarianUserEntity.restore({
            id: row.id,
            tenantId: row.tenantId,
            parliamentarianId: row.parliamentarianId,
            userId: row.userId,
            status: row.status as ParlamentarianUserStatus,
            lastAccessAt: row.lastAccessAt,
            isRemoved: row.isRemoved,
            removedAt: row.removedAt,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }
}
