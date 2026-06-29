import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateMinhaBiografiaDto } from '../dto/update-minha-biografia.dto';

@Injectable()
export class UpdateMinhaBiografiaUseCase {
    constructor(private readonly prisma: PrismaService) {}

    async execute(parliamentarianId: string, tenantId: string, dto: UpdateMinhaBiografiaDto) {
        const parl = await this.prisma.parliamentarian.findFirst({
            where: { id: parliamentarianId, tenantId, isRemoved: false },
        });
        if (!parl) throw new NotFoundException('Parlamentar não encontrado');

        const atualizado = await this.prisma.parliamentarian.update({
            where: { id: parliamentarianId },
            data: { biography: dto.biografia },
        });

        return {
            id: atualizado.id,
            parliamentaryName: atualizado.parliamentaryName,
            biography: atualizado.biography ?? null,
            status: atualizado.status,
        };
    }
}
