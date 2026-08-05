import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantPaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateTenantPaymentDto } from '../dtos/requests/tenant-payment.request';
import { TenantNotFoundError } from '../errors/tenant-not-found.error';
import { formatCompetenceMonth } from '../mappers/tenant-commercial.mapper';
import type { TenantPaymentView } from './list-tenant-payments.use-case';

@Injectable()
export class UpdateTenantPaymentUseCase {
    constructor(private readonly prisma: PrismaService) {}

    async execute(
        tenantId: string,
        paymentId: string,
        dto: UpdateTenantPaymentDto,
    ): Promise<TenantPaymentView> {
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

        const status = dto.status ?? existing.status;
        let paidAt = existing.paidAt;
        if (dto.paidAt !== undefined) {
            paidAt = dto.paidAt ? new Date(dto.paidAt) : null;
        } else if (
            status === TenantPaymentStatus.PAID &&
            !paidAt &&
            dto.status === TenantPaymentStatus.PAID
        ) {
            paidAt = new Date();
        } else if (
            status !== TenantPaymentStatus.PAID &&
            dto.status !== undefined
        ) {
            paidAt = null;
        }

        const payment = await this.prisma.tenantPayment.update({
            where: { id: paymentId },
            data: {
                amountCents: dto.amountCents ?? undefined,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                paidAt,
                status: dto.status ?? undefined,
                method: dto.method === undefined ? undefined : dto.method,
                notes:
                    dto.notes === undefined
                        ? undefined
                        : dto.notes?.trim() || null,
            },
        });

        return {
            id: payment.id,
            competenceMonth: formatCompetenceMonth(payment.competenceMonth),
            amountCents: payment.amountCents,
            dueDate: payment.dueDate.toISOString(),
            paidAt: payment.paidAt?.toISOString() ?? null,
            status: payment.status,
            method: payment.method,
            notes: payment.notes,
            createdAt: payment.createdAt.toISOString(),
            updatedAt: payment.updatedAt.toISOString(),
        };
    }
}
