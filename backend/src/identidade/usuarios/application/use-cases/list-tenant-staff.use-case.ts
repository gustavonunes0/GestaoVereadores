import { Injectable } from '@nestjs/common';
import { TenantUserRole } from '@prisma/client';
import { PaginationQueryDto } from '../../../../common/dto/pagination.dto';
import { paginatedQuery } from '../../../../common/prisma/paginate';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TenantStaffViewModel } from '../view-models/tenant-staff.view-model';

@Injectable()
export class ListTenantStaffUseCase {
    constructor(private readonly prisma: PrismaService) {}

    async execute(tenantId: string, query: PaginationQueryDto) {
        const where = {
            tenantId,
            isRemoved: false,
            isParliamentarian: false,
            role: { in: [TenantUserRole.ADMIN_STAFF, TenantUserRole.STAFF] },
        };

        const result = await paginatedQuery(
            () => this.prisma.tenantUser.count({ where }),
            (skip, take) =>
                this.prisma.tenantUser.findMany({
                    where,
                    skip,
                    take,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                cpf: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                }),
            query,
        );

        return {
            data: result.data.map((row) => TenantStaffViewModel.toHttp(row)),
            meta: result.meta,
        };
    }
}
