import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TenantNotFoundError } from '../errors/tenant-not-found.error';
import {
    formatCompetenceMonth,
    mapTenantCommercialView,
} from '../mappers/tenant-commercial.mapper';
import type { TenantWithStats } from './list-tenants-with-stats.use-case';
import type { TenantPaymentView } from './list-tenant-payments.use-case';

@Injectable()
export class GetTenantDetailUseCase {
    constructor(private readonly prisma: PrismaService) {}

    async execute(id: string): Promise<
        TenantWithStats & {
            recentStaff: Array<{
                id: string;
                nome: string;
                email: string;
                role: string;
                lastAccessAt: string | null;
            }>;
            payments: TenantPaymentView[];
        }
    > {
        const tenant = await this.prisma.tenant.findFirst({
            where: { id, isRemoved: false },
            include: {
                _count: {
                    select: {
                        tenantUsers: { where: { isRemoved: false } },
                        parliamentarians: { where: { isRemoved: false } },
                        materias: { where: { isRemoved: false } },
                        sessoesPlenarias: { where: { isRemoved: false } },
                    },
                },
                tenantUsers: {
                    where: { isRemoved: false },
                    take: 8,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                payments: {
                    where: { isRemoved: false },
                    orderBy: { competenceMonth: 'desc' },
                    take: 36,
                },
            },
        });

        if (!tenant) {
            throw new TenantNotFoundError(id);
        }

        return {
            ...mapTenantCommercialView(tenant),
            stats: {
                staffUsers: tenant._count.tenantUsers,
                parliamentarians: tenant._count.parliamentarians,
                materias: tenant._count.materias,
                sessoes: tenant._count.sessoesPlenarias,
            },
            recentStaff: tenant.tenantUsers.map((tu) => ({
                id: tu.id,
                nome: `${tu.user.firstName} ${tu.user.lastName}`.trim(),
                email: tu.user.email,
                role: tu.role,
                lastAccessAt: tu.lastAccessAt?.toISOString() ?? null,
            })),
            payments: tenant.payments.map((p) => ({
                id: p.id,
                competenceMonth: formatCompetenceMonth(p.competenceMonth),
                amountCents: p.amountCents,
                dueDate: p.dueDate.toISOString(),
                paidAt: p.paidAt?.toISOString() ?? null,
                status: p.status,
                method: p.method,
                notes: p.notes,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString(),
            })),
        };
    }
}
