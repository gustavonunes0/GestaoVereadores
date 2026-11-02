import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ParliamentarianProvisioningDomainService } from '../../domain/services/parliamentarian-provisioning.domain-service';
import {
    assertPhotoFraming,
    defaultPhotoFraming,
    toPhotoFramingNumbers,
} from '../../domain/services/photo-framing';
import { UpdateMeuPerfilDto } from '../dto/update-meu-perfil.dto';

@Injectable()
export class UpdateMeuPerfilUseCase {
    private readonly provisioningService =
        new ParliamentarianProvisioningDomainService();

    constructor(private readonly prisma: PrismaService) {}

    async execute(parliamentarianId: string, tenantId: string, dto: UpdateMeuPerfilDto) {
        const parl = await this.prisma.parliamentarian.findFirst({
            where: { id: parliamentarianId, tenantId, isRemoved: false },
        });
        if (!parl) throw new NotFoundException('Parlamentar não encontrado');

        const prev = toPhotoFramingNumbers(parl);
        const photoChanging =
            dto.photoUrl !== undefined &&
            (dto.photoUrl?.trim() || null) !== (parl.photoUrl ?? null);

        let framing = {
            photoPosX: prev.photoPosX,
            photoPosY: prev.photoPosY,
            photoZoom: prev.photoZoom,
            photoPositionConfirmed: prev.photoPositionConfirmed,
        };

        if (photoChanging) {
            const nextPhoto = dto.photoUrl?.trim() || null;
            framing = nextPhoto
                ? assertPhotoFraming(
                      {
                          photoPosX: dto.photoPosX,
                          photoPosY: dto.photoPosY,
                          photoZoom: dto.photoZoom,
                          photoPositionConfirmed: dto.photoPositionConfirmed,
                      },
                      { requireConfirmed: true },
                  )
                : defaultPhotoFraming();
        } else if (
            dto.photoPosX !== undefined ||
            dto.photoPosY !== undefined ||
            dto.photoZoom !== undefined ||
            dto.photoPositionConfirmed !== undefined
        ) {
            framing = assertPhotoFraming(
                {
                    photoPosX: dto.photoPosX ?? prev.photoPosX,
                    photoPosY: dto.photoPosY ?? prev.photoPosY,
                    photoZoom: dto.photoZoom ?? prev.photoZoom,
                    photoPositionConfirmed:
                        dto.photoPositionConfirmed ?? prev.photoPositionConfirmed,
                },
                { requireConfirmed: false },
            );
        }

        const atualizado = await this.prisma.parliamentarian.update({
            where: { id: parliamentarianId },
            data: {
                ...(dto.parliamentaryName !== undefined && {
                    parliamentaryName: dto.parliamentaryName,
                }),
                ...(dto.photoUrl !== undefined && { photoUrl: dto.photoUrl }),
                ...(dto.gabinete !== undefined && { officeNumber: dto.gabinete }),
                photoPosX: framing.photoPosX,
                photoPosY: framing.photoPosY,
                photoZoom: framing.photoZoom,
                photoPositionConfirmed: framing.photoPositionConfirmed,
            },
        });

        const parlUser = await this.prisma.parlamentarianUser.findFirst({
            where: { parliamentarianId, isRemoved: false },
        });

        if (parlUser && dto.parliamentaryName !== undefined) {
            const { firstName, lastName } =
                this.provisioningService.splitParliamentaryName(
                    atualizado.parliamentaryName,
                );
            await this.prisma.user.update({
                where: { id: parlUser.userId },
                data: { firstName, lastName },
            });
        }

        if (dto.email && parlUser) {
            await this.prisma.user.update({
                where: { id: parlUser.userId },
                data: { email: dto.email },
            });
        }

        const framingOut = toPhotoFramingNumbers(atualizado);
        return {
            id: atualizado.id,
            parliamentaryName: atualizado.parliamentaryName,
            officeNumber: atualizado.officeNumber ?? null,
            photoUrl: atualizado.photoUrl ?? null,
            ...framingOut,
            biography: atualizado.biography ?? null,
            status: atualizado.status,
        };
    }
}
