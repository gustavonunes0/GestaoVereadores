import {
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { TenantUserRole, TenantUserStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { TenantStaffViewModel } from '../view-models/tenant-staff.view-model';
import { StaffUserNameService } from '../../domain/staff-user-name.service';

@Injectable()
export class UpdateTenantStaffUseCase {
    private readonly nameService = new StaffUserNameService();

    constructor(private readonly prisma: PrismaService) {}

    async execute(tenantId: string, id: string, dto: UpdateUsuarioDto) {
        const existing = await this.prisma.tenantUser.findFirst({
            where: {
                id,
                tenantId,
                isRemoved: false,
                isParliamentarian: false,
                role: { in: [TenantUserRole.ADMIN_STAFF, TenantUserRole.STAFF] },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        cpf: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!existing) {
            throw new NotFoundException('Usuário não encontrado nesta câmara');
        }

        if (dto.nome) {
            const { firstName, lastName } = this.nameService.splitDisplayName(
                dto.nome,
            );
            await this.prisma.user.update({
                where: { id: existing.userId },
                data: { firstName, lastName },
            });
        }

        const role = dto.role ?? existing.role;
        const status =
            dto.ativo === undefined
                ? existing.status
                : dto.ativo
                  ? TenantUserStatus.ACTIVE
                  : TenantUserStatus.DISABLED;

        const updated = await this.prisma.tenantUser.update({
            where: { id },
            data: {
                role,
                isTenantAdmin: role === TenantUserRole.ADMIN_STAFF,
                isTenantStaff: true,
                isParliamentarian: false,
                status,
            },
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
        });

        try {
            return TenantStaffViewModel.toHttp(updated);
        } catch (error) {
            if (error instanceof Error && error.message === 'Nome é obrigatório') {
                throw new UnprocessableEntityException(error.message);
            }
            throw error;
        }
    }
}
