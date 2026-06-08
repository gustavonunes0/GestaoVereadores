import { Inject, Injectable } from '@nestjs/common';
import { GuestUserRepository } from '../../domain/repositories/guest-user.repository';
import { GUEST_USER_REPOSITORY } from '../../guest-users.tokens';
import { GuestUserNotFoundError } from '../errors/guest-user-not-found.error';

@Injectable()
export class RemoveGuestUserUseCase {
    constructor(
        @Inject(GUEST_USER_REPOSITORY)
        private readonly guestUserRepository: GuestUserRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        const guest = await this.guestUserRepository.findById(tenantId, id);
        if (!guest) throw new GuestUserNotFoundError(id);
        await this.guestUserRepository.softDelete(tenantId, id);
    }
}
