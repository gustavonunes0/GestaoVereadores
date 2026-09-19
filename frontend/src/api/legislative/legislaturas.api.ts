import { api, apiList } from '../client';
import { API_PATHS } from '../paths';
import type { PaginatedResponse } from '../client';

export type Legislature = {
    id: string;
    number: number;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
};

export type CreateLegislatureInput = {
    number: number;
    startDate: string;
    endDate: string;
    isCurrent?: boolean;
};

export type UpdateLegislatureInput = {
    number?: number;
    startDate?: string;
    endDate?: string | null;
    isCurrent?: boolean;
};

export const legislaturasApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        apiList<Legislature>(API_PATHS.legislaturas, params),

    create: (body: CreateLegislatureInput) =>
        api<Legislature>(API_PATHS.legislaturas, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    update: (id: string, body: UpdateLegislatureInput) =>
        api<Legislature>(`${API_PATHS.legislaturas}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),

    remove: (id: string) =>
        api<{ success: boolean }>(`${API_PATHS.legislaturas}/${id}`, {
            method: 'DELETE',
        }),
};

export type { PaginatedResponse };
