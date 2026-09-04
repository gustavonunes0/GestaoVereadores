import {
    Inject,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { TenantUserRole, TenantUserStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { PasswordHasher } from '../../../users/application/contracts/password-hasher';
import { PASSWORD_HASHER } from '../../../users/users.tokens';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { TenantStaffViewModel } from '../view-models/tenant-staff.view-model';
import { StaffUserNameService } from '../../domain/staff-user-name.service';

@Injectable()
export class UpdateTenantStaffUseCase {
    private readonly nameService = new StaffUserNameService();

    constructor(
        private readonly prisma: PrismaService,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
    ) {}

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

        const passwordHash = dto.password
            ? await this.passwordHasher.hash(dto.password)
            : undefined;

        if (dto.nome || passwordHash) {
            const nameParts = dto.nome
                ? this.nameService.splitDisplayName(dto.nome)
                : null;
            await this.prisma.user.update({
                where: { id: existing.userId },
                data: {
                    ...(nameParts
                        ? {
                              firstName: nameParts.firstName,
                              lastName: nameParts.lastName,
                          }
                        : {}),
                    ...(passwordHash ? { passwordHash } : {}),
                },
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
