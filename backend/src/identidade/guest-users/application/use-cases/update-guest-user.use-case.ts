import { Inject, Injectable } from '@nestjs/common';
import { GuestUserRepository } from '../../domain/repositories/guest-user.repository';
import { GUEST_USER_REPOSITORY } from '../../guest-users.tokens';
import { UpdateGuestUserDto } from '../dto/update-guest-user.dto';
import { GuestUserCpfAlreadyInUseError } from '../errors/guest-user-cpf-already-in-use.error';
import { GuestUserNotFoundError } from '../errors/guest-user-not-found.error';
import { GuestUserViewModel } from '../view-models/guest-user.view-model';

@Injectable()
export class UpdateGuestUserUseCase {
    constructor(
        @Inject(GUEST_USER_REPOSITORY)
        private readonly guestUserRepository: GuestUserRepository,
    ) {}

    async execute(tenantId: string, id: string, dto: UpdateGuestUserDto) {
        const existing = await this.guestUserRepository.findById(tenantId, id);
        if (!existing) throw new GuestUserNotFoundError(id);

        const cpf =
            dto.cpf !== undefined
                ? dto.cpf.replace(/\D/g, '') || null
                : undefined;
        if (cpf) {
            const inUse = await this.guestUserRepository.existsByCpf(
                tenantId,
                cpf,
                id,
            );
            if (inUse) throw new GuestUserCpfAlreadyInUseError(cpf);
        }

        const updated = await this.guestUserRepository.update(tenantId, id, {
            fullName: dto.fullName,
            cpf,
            email: dto.email,
            phone: dto.phone,
            type: dto.type,
            status: dto.status,
            organizationName: dto.organizationName,
            positionName: dto.positionName,
            notes: dto.notes,
        });
        return GuestUserViewModel.toHttp(updated);
    }
}
