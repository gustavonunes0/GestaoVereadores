import { api, apiList } from './client';
import { API_PATHS } from './paths';

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
        apiList<GuestUser>(API_PATHS.guestUsers, params),

    create: (body: CreateGuestUserInput) =>
        api<GuestUser>(API_PATHS.guestUsers, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    remove: (id: string) =>
        api<void>(`${API_PATHS.guestUsers}/${id}`, { method: 'DELETE' }),
};
