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
        const count = await this.prisma.parliamentarian.count({
            where: {
                tenantId,
                tenantUserId,
                isRemoved: false,
                status: 'ACTIVE',
            },
        });
        return count > 0;
    }
}
