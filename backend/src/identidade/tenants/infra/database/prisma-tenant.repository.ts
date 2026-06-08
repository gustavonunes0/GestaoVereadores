import { Injectable } from '@nestjs/common';
import { Prisma, Tenant } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
    TenantEntity,
    TenantPrimitives,
    TenantStatus,
} from '../../domain/tenant.entity';
import { TenantRepository } from '../../domain/tenant.repository';

@Injectable()
export class PrismaTenantRepository implements TenantRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(tenant: TenantEntity): Promise<TenantEntity> {
        const data = tenant.toPrimitives();
        const createdTenant = await this.prisma.tenant.create({
            data: this.toCreateInput(data),
        });

        return this.toEntity(createdTenant);
    }

    async findAll(): Promise<TenantEntity[]> {
        const tenants = await this.prisma.tenant.findMany({
            where: { isRemoved: false },
            orderBy: { createdAt: 'desc' },
        });

        return tenants.map((tenant) => this.toEntity(tenant));
    }

    async findById(id: string): Promise<TenantEntity | null> {
        const tenant = await this.prisma.tenant.findFirst({
            where: { id, isRemoved: false },
        });

        return tenant ? this.toEntity(tenant) : null;
    }

    async findByCnpj(cnpj: string): Promise<TenantEntity | null> {
        const tenant = await this.prisma.tenant.findFirst({
            where: { cnpj, isRemoved: false },
        });

        return tenant ? this.toEntity(tenant) : null;
    }

    async update(tenant: TenantEntity): Promise<TenantEntity> {
        const data = tenant.toPrimitives();
        const updatedTenant = await this.prisma.tenant.update({
            where: { id: data.id },
            data: this.toUpdateInput(data),
        });

        return this.toEntity(updatedTenant);
    }

    async remove(id: string): Promise<void> {
        await this.prisma.tenant.update({
            where: { id },
            data: { isRemoved: true },
        });
    }

    private toEntity(tenant: Tenant) {
        return TenantEntity.restore({
            id: tenant.id,
            name: tenant.name,
            cnpj: tenant.cnpj,
            logo: tenant.logo,
            status: tenant.status as unknown as TenantStatus,
            settings: this.normalizeSettings(tenant.settings),
            createdAt: tenant.createdAt,
            createdBy: tenant.createdBy,
            modifiedAt: tenant.modifiedAt,
            modifiedBy: tenant.modifiedBy,
            isRemoved: tenant.isRemoved,
        });
    }

    private toCreateInput(
        tenant: TenantPrimitives,
    ): Prisma.TenantUncheckedCreateInput {
        return {
            id: tenant.id,
            name: tenant.name,
            cnpj: tenant.cnpj,
            logo: tenant.logo,
            status: tenant.status,
            settings: tenant.settings as Prisma.InputJsonValue | undefined,
            createdAt: tenant.createdAt,
            createdBy: tenant.createdBy,
            modifiedAt: tenant.modifiedAt,
            modifiedBy: tenant.modifiedBy,
            isRemoved: tenant.isRemoved,
        };
    }

    private toUpdateInput(
        tenant: TenantPrimitives,
    ): Prisma.TenantUncheckedUpdateInput {
        return {
            name: tenant.name,
            cnpj: tenant.cnpj,
            logo: tenant.logo,
            status: tenant.status,
            settings: tenant.settings as Prisma.InputJsonValue | undefined,
            createdBy: tenant.createdBy,
            modifiedBy: tenant.modifiedBy,
            isRemoved: tenant.isRemoved,
        };
    }

    private normalizeSettings(settings: Prisma.JsonValue | null) {
        if (
            !settings ||
            typeof settings !== 'object' ||
            Array.isArray(settings)
        ) {
            return null;
        }

        return settings as Record<string, unknown>;
    }
}
