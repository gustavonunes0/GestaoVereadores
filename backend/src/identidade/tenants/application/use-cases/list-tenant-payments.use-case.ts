import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TenantNotFoundError } from '../errors/tenant-not-found.error';
import { formatCompetenceMonth } from '../mappers/tenant-commercial.mapper';

export type TenantPaymentView = {
    id: string;
    competenceMonth: string;
    amountCents: number;
    dueDate: string;
    paidAt: string | null;
    status: string;
    method: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
};

@Injectable()
export class ListTenantPaymentsUseCase {
    constructor(private readonly prisma: PrismaService) {}

    async execute(tenantId: string): Promise<TenantPaymentView[]> {
        const tenant = await this.prisma.tenant.findFirst({
            where: { id: tenantId, isRemoved: false },
            select: { id: true },
        });
        if (!tenant) {
            throw new TenantNotFoundError(tenantId);
        }

        const payments = await this.prisma.tenantPayment.findMany({
            where: { tenantId, isRemoved: false },
            orderBy: { competenceMonth: 'desc' },
        });

        return payments.map((p) => ({
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
        }));
    }
}
