import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
    mapTenantCommercialView,
    type TenantCommercialView,
} from '../mappers/tenant-commercial.mapper';

export type TenantWithStats = TenantCommercialView & {
    stats: {
        staffUsers: number;
        parliamentarians: number;
        materias: number;
        sessoes: number;
    };
};

@Injectable()
export class ListTenantsWithStatsUseCase {
    constructor(private readonly prisma: PrismaService) {}

    async execute(): Promise<TenantWithStats[]> {
        const tenants = await this.prisma.tenant.findMany({
            where: { isRemoved: false },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        tenantUsers: {
                            where: { isRemoved: false },
                        },
                        parliamentarians: {
                            where: { isRemoved: false },
                        },
                        materias: {
                            where: { isRemoved: false },
                        },
                        sessoesPlenarias: {
                            where: { isRemoved: false },
                        },
                    },
                },
            },
        });

        return tenants.map((t) => ({
            ...mapTenantCommercialView(t),
            stats: {
                staffUsers: t._count.tenantUsers,
                parliamentarians: t._count.parliamentarians,
                materias: t._count.materias,
                sessoes: t._count.sessoesPlenarias,
            },
        }));
    }
}
