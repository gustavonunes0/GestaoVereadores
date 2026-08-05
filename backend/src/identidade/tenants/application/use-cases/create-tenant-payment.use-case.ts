import { ConflictException, Injectable } from '@nestjs/common';
import { TenantPaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateTenantPaymentDto } from '../dtos/requests/tenant-payment.request';
import { TenantNotFoundError } from '../errors/tenant-not-found.error';
import {
    competenceMonthToDate,
    formatCompetenceMonth,
} from '../mappers/tenant-commercial.mapper';
import type { TenantPaymentView } from './list-tenant-payments.use-case';

@Injectable()
export class CreateTenantPaymentUseCase {
    constructor(private readonly prisma: PrismaService) {}

    async execute(
        tenantId: string,
        dto: CreateTenantPaymentDto,
    ): Promise<TenantPaymentView> {
        const tenant = await this.prisma.tenant.findFirst({
            where: { id: tenantId, isRemoved: false },
            select: { id: true },
        });
        if (!tenant) {
            throw new TenantNotFoundError(tenantId);
        }

        const competenceMonth = competenceMonthToDate(dto.competenceMonth);
        const status = dto.status ?? TenantPaymentStatus.PENDING;
        const paidAt =
            status === TenantPaymentStatus.PAID
                ? dto.paidAt
                    ? new Date(dto.paidAt)
                    : new Date()
                : dto.paidAt
                  ? new Date(dto.paidAt)
                  : null;

        const existing = await this.prisma.tenantPayment.findUnique({
            where: {
                tenantId_competenceMonth: { tenantId, competenceMonth },
            },
        });

        if (existing && !existing.isRemoved) {
            throw new ConflictException(
                'Já existe pagamento para esta competência',
            );
        }

        const payment = existing
            ? await this.prisma.tenantPayment.update({
                  where: { id: existing.id },
                  data: {
                      amountCents: dto.amountCents,
                      dueDate: new Date(dto.dueDate),
                      paidAt,
                      status,
                      method: dto.method ?? null,
                      notes: dto.notes?.trim() || null,
                      isRemoved: false,
                      removedAt: null,
                  },
              })
            : await this.prisma.tenantPayment.create({
                  data: {
                      tenantId,
                      competenceMonth,
                      amountCents: dto.amountCents,
                      dueDate: new Date(dto.dueDate),
                      paidAt,
                      status,
                      method: dto.method ?? null,
                      notes: dto.notes?.trim() || null,
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
