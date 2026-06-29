import { Injectable } from '@nestjs/common';
import { BoardStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class PresidenciaService {
    constructor(private readonly prisma: PrismaService) {}

    async isPresidente(parliamentarianId: string, tenantId: string): Promise<boolean> {
        const boardAtivo = await this.prisma.board.findFirst({
            where: { tenantId, status: BoardStatus.ACTIVE, isRemoved: false },
            include: {
                members: {
                    where: { isRemoved: false },
                    include: { boardRole: true },
                },
            },
        });

        if (!boardAtivo) return false;

        return boardAtivo.members.some(
            m => m.parliamentarianId === parliamentarianId && m.boardRole.name === 'Presidente',
        );
    }
}
