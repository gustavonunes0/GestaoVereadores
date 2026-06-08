import { Inject, Injectable } from '@nestjs/common';
import { GuestUserRepository } from '../../domain/repositories/guest-user.repository';
import { GUEST_USER_REPOSITORY } from '../../guest-users.tokens';
import { CreateGuestUserDto } from '../dto/create-guest-user.dto';
import { GuestUserCpfAlreadyInUseError } from '../errors/guest-user-cpf-already-in-use.error';
import { GuestUserViewModel } from '../view-models/guest-user.view-model';

@Injectable()
export class CreateGuestUserUseCase {
    constructor(
        @Inject(GUEST_USER_REPOSITORY)
        private readonly guestUserRepository: GuestUserRepository,
    ) {}

    async execute(tenantId: string, dto: CreateGuestUserDto) {
        const cpf = dto.cpf?.replace(/\D/g, '') || null;
        if (cpf) {
            const inUse = await this.guestUserRepository.existsByCpf(
                tenantId,
                cpf,
            );
            if (inUse) throw new GuestUserCpfAlreadyInUseError(cpf);
        }

        const payload = {
            tenantId,
            fullName: dto.fullName,
            cpf,
            email: dto.email ?? null,
            phone: dto.phone ?? null,
            type: dto.type,
            status: dto.status,
            organizationName: dto.organizationName ?? null,
            positionName: dto.positionName ?? null,
            notes: dto.notes ?? null,
        };

        const removed =
            cpf != null
                ? await this.guestUserRepository.findRemovedByCpf(tenantId, cpf)
                : null;

        const saved = removed
            ? await this.guestUserRepository.reactivate(
                  tenantId,
                  removed.id,
                  payload,
              )
            : await this.guestUserRepository.create(payload);

        return GuestUserViewModel.toHttp(saved);
    }
}
