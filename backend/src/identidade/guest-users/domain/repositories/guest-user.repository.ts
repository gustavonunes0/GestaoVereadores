import { PaginatedResult } from '../../../../common/dto/pagination.dto';
import { GuestUserEntity } from '../entities/guest-user.entity';
import {
    GuestUserStatus,
    GuestUserType,
} from '../enums/guest-user.enums';

export type CreateGuestUserRepositoryInput = {
    tenantId: string;
    fullName: string;
    cpf?: string | null;
    email?: string | null;
    phone?: string | null;
    type?: GuestUserType;
    status?: GuestUserStatus;
    organizationName?: string | null;
    positionName?: string | null;
    notes?: string | null;
};

export type UpdateGuestUserRepositoryInput = Partial<
    Omit<CreateGuestUserRepositoryInput, 'tenantId'>
>;

export type ListGuestUsersRepositoryQuery = {
    search?: string;
    type?: GuestUserType;
    status?: GuestUserStatus;
    page?: number;
    limit?: number;
};

export abstract class GuestUserRepository {
    abstract create(
        data: CreateGuestUserRepositoryInput,
    ): Promise<GuestUserEntity>;

    abstract findMany(
        tenantId: string,
        query: ListGuestUsersRepositoryQuery,
    ): Promise<PaginatedResult<GuestUserEntity>>;

    abstract findById(
        tenantId: string,
        id: string,
    ): Promise<GuestUserEntity | null>;

    abstract existsByCpf(
        tenantId: string,
        cpf: string,
        ignoreGuestUserId?: string,
    ): Promise<boolean>;

    abstract findRemovedByCpf(
        tenantId: string,
        cpf: string,
    ): Promise<GuestUserEntity | null>;

    abstract reactivate(
        tenantId: string,
        id: string,
        data: CreateGuestUserRepositoryInput,
    ): Promise<GuestUserEntity>;

    abstract update(
        tenantId: string,
        id: string,
        data: UpdateGuestUserRepositoryInput,
    ): Promise<GuestUserEntity>;

    abstract softDelete(tenantId: string, id: string): Promise<void>;
}
