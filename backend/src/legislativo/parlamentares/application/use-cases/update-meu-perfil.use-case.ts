import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateMeuPerfilDto } from '../dto/update-meu-perfil.dto';

@Injectable()
export class UpdateMeuPerfilUseCase {
    constructor(private readonly prisma: PrismaService) {}

    async execute(parliamentarianId: string, tenantId: string, dto: UpdateMeuPerfilDto) {
        const parl = await this.prisma.parliamentarian.findFirst({
            where: { id: parliamentarianId, tenantId, isRemoved: false },
        });
        if (!parl) throw new NotFoundException('Parlamentar não encontrado');

        const atualizado = await this.prisma.parliamentarian.update({
            where: { id: parliamentarianId },
            data: {
                ...(dto.parliamentaryName !== undefined && { parliamentaryName: dto.parliamentaryName }),
                ...(dto.photoUrl !== undefined && { photoUrl: dto.photoUrl }),
                ...(dto.gabinete !== undefined && { officeNumber: dto.gabinete }),
            },
        });

        if (dto.email) {
            const parlUser = await this.prisma.parlamentarianUser.findFirst({
                where: { parliamentarianId, isRemoved: false },
            });
            if (parlUser) {
                await this.prisma.user.update({
                    where: { id: parlUser.userId },
                    data: { email: dto.email },
                });
            }
        }

        return {
            id: atualizado.id,
            parliamentaryName: atualizado.parliamentaryName,
            officeNumber: atualizado.officeNumber ?? null,
            photoUrl: atualizado.photoUrl ?? null,
            biography: atualizado.biography ?? null,
            status: atualizado.status,
        };
    }
}
