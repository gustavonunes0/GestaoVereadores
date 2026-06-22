import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { tenantWhere } from '../../../../common/prisma/tenant-scope';
import { ParliamentarianStatus } from '../../domain/enums/parliamentarian-status.enum';

export type ActiveParliamentarianUserHttp = {
    parliamentarianId: string;
    parliamentaryName: string;
    user: { nome: string } | null;
};

@Injectable()
export class ListActiveParliamentarianUsersUseCase {
    constructor(private readonly prisma: PrismaService) {}

    async execute(tenantId: string): Promise<ActiveParliamentarianUserHttp[]> {
        const rows = await this.prisma.parliamentarian.findMany({
            where: {
                ...tenantWhere(tenantId),
                status: ParliamentarianStatus.ACTIVE,
                parliamentarianUser: { isRemoved: false },
            },
            orderBy: { parliamentaryName: 'asc' },
            select: {
                id: true,
                parliamentaryName: true,
                parliamentarianUser: {
                    select: {
                        user: {
                            select: { firstName: true, lastName: true },
                        },
                    },
                },
            },
        });

        return rows.map((row) => {
            const user = row.parliamentarianUser?.user;
            return {
                parliamentarianId: row.id,
                parliamentaryName: row.parliamentaryName,
                user: user
                    ? {
                          nome: `${user.firstName} ${user.lastName}`.trim(),
                      }
                    : null,
            };
        });
    }
}
