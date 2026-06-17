import { Injectable } from '@nestjs/common';
import {
    AuthenticatedUser,
    isParlamentarianUser,
    isStaffUser,
} from '../../../common/types/authenticated-request';
import { CamaraAuthRepository } from '../../domain/repositories/camara-auth.repository';
import { TenantAuthRepository } from '../../domain/repositories/tenant-auth.repository';
import { SiglUserRepository } from '../../domain/repositories/sigl-user.repository';
import { InvalidCredentialsError } from '../errors/auth.errors';
import { AuthSessionViewModel } from '../view-models/auth-session.view-model';

@Injectable()
export class GetCurrentUserUseCase {
    constructor(
        private readonly siglUsers: SiglUserRepository,
        private readonly camaraAuth: CamaraAuthRepository,
        private readonly tenants: TenantAuthRepository,
    ) {}

    async execute(user: AuthenticatedUser) {
        if (user.authType === 'camara') {
            const record = await this.camaraAuth.findProfileById(user.id);
            if (!record) {
                throw new InvalidCredentialsError();
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
                    parliamentarianUserId: user.parliamentarianUserId,
                    parliamentarianId: user.parliamentarianId,
                    parliamentaryName: user.parliamentaryName,
                });
            }

            return AuthSessionViewModel.camaraProfile(record);
        }

        const record = await this.siglUsers.findProfileById(user.id);
        if (!record) {
            throw new InvalidCredentialsError();
        }
        return AuthSessionViewModel.siglProfile(record);
    }
}
