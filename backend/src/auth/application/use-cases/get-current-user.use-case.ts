import { Injectable } from '@nestjs/common';
import {
    AuthenticatedUser,
    isParlamentarianUser,
    isPlatformUser,
    isStaffUser,
} from '../../../common/types/authenticated-request';
import { CamaraAuthRepository } from '../../domain/repositories/camara-auth.repository';
import { TenantAuthRepository } from '../../domain/repositories/tenant-auth.repository';
import { InvalidCredentialsError } from '../errors/auth.errors';
import { AuthSessionViewModel } from '../view-models/auth-session.view-model';

@Injectable()
export class GetCurrentUserUseCase {
    constructor(
        private readonly camaraAuth: CamaraAuthRepository,
        private readonly tenants: TenantAuthRepository,
    ) {}

    async execute(user: AuthenticatedUser) {
        const record = await this.camaraAuth.findProfileById(user.id);
        if (!record) {
            throw new InvalidCredentialsError();
        }

        if (isPlatformUser(user)) {
            if (!record.isPlatformAdmin) {
                throw new InvalidCredentialsError();
            }
            return AuthSessionViewModel.platformAdminMe({
                id: user.id,
                name: `${record.firstName} ${record.lastName}`.trim(),
                cpf: record.cpf,
                email: record.email,
            });
        }

        if (isStaffUser(user)) {
            const tenant = await this.tenants.findActiveById(user.tenantId);
            return AuthSessionViewModel.camaraStaffMe({
                id: user.id,
                name: `${record.firstName} ${record.lastName}`.trim(),
                cpf: record.cpf,
                email: record.email,
                tenantId: user.tenantId,
                tenantName: tenant?.name,
                tenantLogo: tenant?.logo,
                tenantUserId: user.tenantUserId,
                role: user.role,
            });
        }

        if (isParlamentarianUser(user)) {
            const tenant = await this.tenants.findActiveById(user.tenantId);
            return AuthSessionViewModel.camaraParliamentarianMe({
                id: user.id,
                name: `${record.firstName} ${record.lastName}`.trim(),
                cpf: record.cpf,
                email: record.email,
                tenantId: user.tenantId,
                tenantName: tenant?.name,
                tenantLogo: tenant?.logo,
                parliamentarianUserId: user.parliamentarianUserId,
                parliamentarianId: user.parliamentarianId,
                parliamentaryName: user.parliamentaryName,
            });
        }

        return AuthSessionViewModel.camaraProfile(record);
    }
}
