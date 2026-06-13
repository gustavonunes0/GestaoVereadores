import { api, apiList } from '../client';
import { API_PATHS } from '../paths';

export const agendaApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        apiList<unknown>(API_PATHS.legislative.agenda, params),

    create: (body: Record<string, unknown>) =>
        api(API_PATHS.legislative.agenda, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    remove: (id: string) =>
        api<void>(`${API_PATHS.legislative.agenda}/${id}`, {
            method: 'DELETE',
        }),
};
