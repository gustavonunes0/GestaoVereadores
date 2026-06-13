import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../../common/types/authenticated-request';
import { CamaraAuthRepository } from '../../domain/repositories/camara-auth.repository';
import { SiglUserRepository } from '../../domain/repositories/sigl-user.repository';
import { InvalidCredentialsError } from '../errors/auth.errors';
import { AuthSessionViewModel } from '../view-models/auth-session.view-model';

@Injectable()
export class GetCurrentUserUseCase {
    constructor(
        private readonly siglUsers: SiglUserRepository,
        private readonly camaraAuth: CamaraAuthRepository,
    ) {}

    async execute(user: AuthenticatedUser) {
        if (user.authType === 'camara') {
            const record = await this.camaraAuth.findProfileById(user.id);
            if (!record) {
                throw new InvalidCredentialsError();
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
