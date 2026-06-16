import { api, apiList } from '../client';
import { API_PATHS } from '../paths';

export type Parliamentarian = {
    id: string;
    tenantUserId: string;
    parliamentaryName: string;
    officeNumber?: string;
    photoUrl?: string;
    biography?: string;
    status: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    politicalParty?: {
        id: string;
        name: string;
        acronym: string;
        flagUrl?: string;
    };
    activeMandatesCount?: number;
};

export type CreateParliamentarianInput = {
    tenantUserId: string;
    politicalPartyId?: string;
    parliamentaryName: string;
    officeNumber?: string;
    photoUrl?: string;
    biography?: string;
};

export type UpdateParliamentarianInput = Partial<
    Omit<CreateParliamentarianInput, 'tenantUserId'>
>;

export const parlamentaresApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        apiList<Parliamentarian>(API_PATHS.parlamentares, params),

    getById: (id: string) =>
        api<Parliamentarian>(`${API_PATHS.parlamentares}/${id}`),

    create: (body: CreateParliamentarianInput) =>
        api<Parliamentarian>(API_PATHS.parlamentares, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    update: (id: string, body: UpdateParliamentarianInput) =>
        api<Parliamentarian>(`${API_PATHS.parlamentares}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),

    remove: (id: string) =>
        api<void>(`${API_PATHS.parlamentares}/${id}`, {
            method: 'DELETE',
        }),

    getMandatos: (id: string) =>
        api<unknown[]>(`${API_PATHS.parlamentares}/${id}/mandates`),
};
