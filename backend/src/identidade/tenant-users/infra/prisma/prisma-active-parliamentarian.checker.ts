import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ActiveParliamentarianChecker } from '../../domain/contracts/active-parliamentarian-checker';

@Injectable()
export class PrismaActiveParliamentarianChecker extends ActiveParliamentarianChecker {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async hasActiveParliamentarian(
        tenantId: string,
        tenantUserId: string,
    ): Promise<boolean> {
        const tenantUser = await this.prisma.tenantUser.findFirst({
            where: { id: tenantUserId, tenantId, isRemoved: false },
            select: { userId: true },
        });
        if (!tenantUser) return false;

        const count = await this.prisma.parlamentarianUser.count({
            where: {
                tenantId,
                userId: tenantUser.userId,
                isRemoved: false,
                status: 'ACTIVE',
            },
        });
        return count > 0;
    }
}
