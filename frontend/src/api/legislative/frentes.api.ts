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

export const frentesApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        apiList<ParliamentaryFront>(API_PATHS.legislative.frentes, params),

    create: (body: CreateFrontInput) =>
        api<ParliamentaryFront>(API_PATHS.legislative.frentes, {
            method: 'POST',
            body: JSON.stringify(body),
        }),
};
