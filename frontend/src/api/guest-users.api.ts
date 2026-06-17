/**
 * @deprecated Substituído por autores-externos.api.ts
 * Mantido para compatibilidade retroativa. Não usar em código novo.
 */
import { api, apiList } from './client';

const GUEST_USERS_PATH = '/guest-users';

export type GuestUser = {
    id: string;
    fullName: string;
    cpf?: string;
    email?: string;
    phone?: string;
    type?: string;
    status?: string;
    organizationName?: string;
    positionName?: string;
    notes?: string;
};

export type CreateGuestUserInput = {
    fullName: string;
    cpf?: string;
    email?: string;
    phone?: string;
    type?: string;
    organizationName?: string;
    positionName?: string;
    notes?: string;
};

export const guestUsersApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        apiList<GuestUser>(GUEST_USERS_PATH, params),

    create: (body: CreateGuestUserInput) =>
        api<GuestUser>(GUEST_USERS_PATH, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    remove: (id: string) =>
        api<void>(`${GUEST_USERS_PATH}/${id}`, { method: 'DELETE' }),
};
