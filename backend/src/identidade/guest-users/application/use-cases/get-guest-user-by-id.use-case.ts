import { Inject, Injectable } from '@nestjs/common';
import { GuestUserRepository } from '../../domain/repositories/guest-user.repository';
import { GUEST_USER_REPOSITORY } from '../../guest-users.tokens';
import { GuestUserNotFoundError } from '../errors/guest-user-not-found.error';
import { GuestUserViewModel } from '../view-models/guest-user.view-model';

@Injectable()
export class GetGuestUserByIdUseCase {
    constructor(
        @Inject(GUEST_USER_REPOSITORY)
        private readonly guestUserRepository: GuestUserRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        const guest = await this.guestUserRepository.findById(tenantId, id);
        if (!guest) throw new GuestUserNotFoundError(id);
        return GuestUserViewModel.toHttp(guest);
    }
}
