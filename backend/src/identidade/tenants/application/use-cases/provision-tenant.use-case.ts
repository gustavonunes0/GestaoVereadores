import { Inject, Injectable } from '@nestjs/common';
import { TenantUserRole, TenantUserStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { PasswordHasher } from '../../../users/application/contracts/password-hasher';
import { PASSWORD_HASHER } from '../../../users/users.tokens';
import { TenantEntity, TenantPrimitives } from '../../domain/tenant.entity';
import { TenantRepository } from '../../domain/tenant.repository';
import { TENANT_REPOSITORY } from '../../tenants.tokens';
import { ProvisionTenantDto } from '../dtos/requests/provision-tenant.request';
import { TenantCnpjAlreadyInUseError } from '../errors/tenant-cnpj-already-in-use.error';

export type ProvisionTenantResult = {
    tenant: TenantPrimitives;
    admin?: {
        userId: string;
        email: string;
        tenantUserId: string;
    };
};

@Injectable()
export class ProvisionTenantUseCase {
    constructor(
        @Inject(TENANT_REPOSITORY)
        private readonly tenantRepository: TenantRepository,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
        private readonly prisma: PrismaService,
    ) {}

    async execute(dto: ProvisionTenantDto): Promise<ProvisionTenantResult> {
        const normalizedCnpj = dto.cnpj.replace(/\D/g, '');
        const existingTenant =
            await this.tenantRepository.findByCnpj(normalizedCnpj);
        if (existingTenant) {
            throw new TenantCnpjAlreadyInUseError(normalizedCnpj);
        }

        if (dto.admin?.email) {
            const emailTaken = await this.prisma.user.findFirst({
                where: {
                    email: dto.admin.email.trim().toLowerCase(),
                    isRemoved: false,
                },
                select: { id: true },
            });
            if (emailTaken) {
                throw new Error('E-mail do administrador já está em uso');
            }
        }

        const tenant = TenantEntity.create({
            name: dto.name,
            cnpj: normalizedCnpj,
            logo: dto.logo,
            status: dto.status,
            settings: dto.settings,
            tradeName: dto.tradeName,
            city: dto.city,
            state: dto.state,
            contactName: dto.contactName,
            contactEmail: dto.contactEmail,
            contactPhone: dto.contactPhone,
            plan: dto.plan,
            contractStartAt: dto.contractStartAt ?? null,
            contractEndAt: dto.contractEndAt ?? null,
            monthlyFeeCents: dto.monthlyFeeCents,
            billingDay: dto.billingDay,
            maxParliamentarians: dto.maxParliamentarians,
            notes: dto.notes,
        });

        const createdTenant = await this.tenantRepository.create(tenant);
        const result: ProvisionTenantResult = {
            tenant: createdTenant.toPrimitives(),
        };

        if (!dto.admin) {
            return result;
        }

        const passwordHash = await this.passwordHasher.hash(dto.admin.password);
        const cpf = dto.admin.cpf?.replace(/\D/g, '') || null;

        const user = await this.prisma.user.create({
            data: {
                firstName: dto.admin.firstName.trim(),
                lastName: dto.admin.lastName.trim(),
                email: dto.admin.email.trim().toLowerCase(),
                cpf,
                passwordHash,
            },
        });

        const tenantUser = await this.prisma.tenantUser.create({
            data: {
                tenantId: createdTenant.id,
                userId: user.id,
                role: TenantUserRole.ADMIN_STAFF,
                isTenantAdmin: true,
                isTenantStaff: true,
                isParliamentarian: false,
                status: TenantUserStatus.ACTIVE,
            },
        });

        result.admin = {
            userId: user.id,
            email: user.email,
            tenantUserId: tenantUser.id,
        };

        return result;
    }
}
