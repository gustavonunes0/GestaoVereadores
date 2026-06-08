import { GuestUserEntity } from '../../domain/entities/guest-user.entity';

export class GuestUserViewModel {
    static toHttp(guest: GuestUserEntity) {
        const d = guest.toPrimitives();
        return {
            id: d.id,
            fullName: d.fullName,
            cpf: d.cpf,
            email: d.email,
            phone: d.phone,
            type: d.type,
            status: d.status,
            organizationName: d.organizationName,
            positionName: d.positionName,
            notes: d.notes,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
        };
    }
}
