import { Injectable } from '@nestjs/common';
import { TenantStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { TenantAuthEntity } from '../../domain/entities/tenant-access.entity';
import { TenantAuthRepository } from '../../domain/repositories/tenant-auth.repository';

@Injectable()
export class PrismaTenantAuthRepository extends TenantAuthRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async findActiveById(id: string): Promise<TenantAuthEntity | null> {
        const row = await this.prisma.tenant.findFirst({
            where: {
                id,
                isRemoved: false,
                status: TenantStatus.ACTIVE,
            },
        });
        return row ? this.toEntity(row) : null;
    }

    async findActiveByCnpj(cnpj: string): Promise<TenantAuthEntity | null> {
        const row = await this.prisma.tenant.findFirst({
            where: { cnpj, isRemoved: false, status: TenantStatus.ACTIVE },
        });
        return row ? this.toEntity(row) : null;
    }

    async findFirstActive(): Promise<TenantAuthEntity | null> {
        const row = await this.prisma.tenant.findFirst({
            where: { isRemoved: false, status: TenantStatus.ACTIVE },
            orderBy: { createdAt: 'asc' },
        });
        return row ? this.toEntity(row) : null;
    }

    private toEntity(row: {
        id: string;
        name: string;
        cnpj: string;
        status: TenantStatus;
    }): TenantAuthEntity {
        return new TenantAuthEntity({
            id: row.id,
            name: row.name,
            cnpj: row.cnpj,
            status: row.status,
        });
    }
}
