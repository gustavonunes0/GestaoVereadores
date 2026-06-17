import {
    ConflictException,
    Inject,
    Injectable,
    UnprocessableEntityException,
} from '@nestjs/common';
import { TenantUserRole, TenantUserStatus } from '@prisma/client';
import { UserRepository } from '../../../users/domain/user.repository';
import { USER_REPOSITORY } from '../../../users/users.tokens';
import { PasswordHasher } from '../../../users/application/contracts/password-hasher';
import { PASSWORD_HASHER } from '../../../users/users.tokens';
import { UserEntity } from '../../../users/domain/user.entity';
import { UserCpfAlreadyInUseError } from '../../../users/application/errors/user-cpf-already-in-use.error';
import { UserEmailAlreadyInUseError } from '../../../users/application/errors/user-email-already-in-use.error';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ConvidarUsuarioDto } from '../dto/convidar-usuario.dto';
import { TenantStaffViewModel } from '../view-models/tenant-staff.view-model';
import { StaffUserNameService } from '../../domain/staff-user-name.service';

@Injectable()
export class ConvidarTenantStaffUseCase {
    private readonly nameService = new StaffUserNameService();

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
        private readonly prisma: PrismaService,
    ) {}

    async execute(tenantId: string, dto: ConvidarUsuarioDto) {
        const normalizedCpf = dto.cpf.replace(/\D/g, '');
        const { firstName, lastName } = this.nameService.splitDisplayName(
            dto.nome,
        );
        const email = dto.email?.trim()
            ? dto.email.trim().toLowerCase()
            : this.nameService.buildEmailFromCpf(normalizedCpf);

        const existingByCpf =
            await this.userRepository.findByCpf(normalizedCpf);
        if (existingByCpf) {
            const linked = await this.prisma.tenantUser.findFirst({
                where: {
                    tenantId,
                    userId: existingByCpf.id,
                    isRemoved: false,
                },
            });
            if (linked) {
                throw new ConflictException(
                    'Já existe um usuário com este CPF nesta câmara',
                );
            }
            throw new ConflictException(
                'CPF já cadastrado no sistema. Vincule o usuário existente em outro fluxo.',
            );
        }

        const existingByEmail = await this.userRepository.findByEmail(email);
        if (existingByEmail) {
            throw new ConflictException(
                'Já existe um usuário com este e-mail',
            );
        }

        try {
            const passwordHash = await this.passwordHasher.hash(dto.password);
            const user = UserEntity.create({
                firstName,
                lastName,
                cpf: normalizedCpf,
                email,
                passwordHash,
            });
            const createdUser = await this.userRepository.create(user);

            const tenantUser = await this.prisma.tenantUser.create({
                data: {
                    tenantId,
                    userId: createdUser.id,
                    role: dto.role,
                    isTenantAdmin: dto.role === TenantUserRole.ADMIN_STAFF,
                    isTenantStaff: true,
                    isParliamentarian: false,
                    status: TenantUserStatus.ACTIVE,
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

            return TenantStaffViewModel.toHttp(tenantUser);
        } catch (error) {
            if (error instanceof UserCpfAlreadyInUseError) {
                throw new ConflictException(error.message);
            }
            if (error instanceof UserEmailAlreadyInUseError) {
                throw new ConflictException(error.message);
            }
            if (error instanceof Error && error.message === 'Nome é obrigatório') {
                throw new UnprocessableEntityException(error.message);
            }
            throw error;
        }
    }
}
