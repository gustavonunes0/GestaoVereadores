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
    endDate?: string;
    isCurrent?: boolean;
};

export const legislaturasApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        apiList<Legislature>(API_PATHS.legislative.legislaturas, params),

    create: (body: CreateLegislatureInput) =>
        api<Legislature>(API_PATHS.legislative.legislaturas, {
            method: 'POST',
            body: JSON.stringify(body),
        }),
};

export type { PaginatedResponse };
