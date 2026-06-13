import { api, apiList } from '../client';
import { API_PATHS } from '../paths';

export const materiasApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        apiList<unknown>(API_PATHS.legislative.materias, params),

    create: (body: Record<string, unknown>) =>
        api(API_PATHS.legislative.materias, {
            method: 'POST',
            body: JSON.stringify(body),
        }),
};
