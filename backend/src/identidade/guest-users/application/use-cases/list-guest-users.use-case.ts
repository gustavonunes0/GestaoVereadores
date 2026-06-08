import { Inject, Injectable } from '@nestjs/common';
import { GuestUserRepository } from '../../domain/repositories/guest-user.repository';
import { GUEST_USER_REPOSITORY } from '../../guest-users.tokens';
import { ListGuestUsersQueryDto } from '../dto/list-guest-users-query.dto';
import { GuestUserViewModel } from '../view-models/guest-user.view-model';

@Injectable()
export class ListGuestUsersUseCase {
    constructor(
        @Inject(GUEST_USER_REPOSITORY)
        private readonly guestUserRepository: GuestUserRepository,
    ) {}

    async execute(tenantId: string, query: ListGuestUsersQueryDto) {
        const result = await this.guestUserRepository.findMany(tenantId, query);
        return {
            data: result.data.map((g) => GuestUserViewModel.toHttp(g)),
            meta: result.meta,
        };
    }
}
