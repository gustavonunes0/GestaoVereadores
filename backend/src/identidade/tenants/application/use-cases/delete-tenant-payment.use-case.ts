import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TenantNotFoundError } from '../errors/tenant-not-found.error';

@Injectable()
export class DeleteTenantPaymentUseCase {
    constructor(private readonly prisma: PrismaService) {}

    async execute(tenantId: string, paymentId: string): Promise<void> {
        const tenant = await this.prisma.tenant.findFirst({
            where: { id: tenantId, isRemoved: false },
            select: { id: true },
        });
        if (!tenant) {
            throw new TenantNotFoundError(tenantId);
        }

        const existing = await this.prisma.tenantPayment.findFirst({
            where: { id: paymentId, tenantId, isRemoved: false },
        });
        if (!existing) {
            throw new NotFoundException('Pagamento não encontrado');
        }

        await this.prisma.tenantPayment.update({
            where: { id: paymentId },
            data: { isRemoved: true, removedAt: new Date() },
        });
    }
}
