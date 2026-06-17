import { api, apiList } from '../client';
import { API_PATHS } from '../paths';

export type FrontStatus = 'ACTIVE' | 'INACTIVE' | 'FINISHED';

export type ParliamentaryFront = {
    id: string;
    name: string;
    theme: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status: FrontStatus;
};

export type CreateFrontInput = {
    name: string;
    theme: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: FrontStatus;
    coordinatorParliamentarianId?: string;
};

export type FrenteFiltros = {
    search?: string;
    theme?: string;
    status?: FrontStatus;
    page?: number;
    limit?: number;
};

export const frentesApi = {
    list: (params?: FrenteFiltros) =>
        apiList<ParliamentaryFront>(API_PATHS.frentes, params),

    getById: (id: string) =>
        api<ParliamentaryFront>(`${API_PATHS.frentes}/${id}`),

    create: (body: CreateFrontInput) =>
        api<ParliamentaryFront>(API_PATHS.frentes, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    update: (id: string, body: Partial<CreateFrontInput>) =>
        api<ParliamentaryFront>(`${API_PATHS.frentes}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),

    remove: (id: string) =>
        api<void>(`${API_PATHS.frentes}/${id}`, {
            method: 'DELETE',
        }),
};
