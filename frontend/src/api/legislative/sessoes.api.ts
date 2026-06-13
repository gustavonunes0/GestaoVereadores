import { api, apiList } from '../client';
import { API_PATHS } from '../paths';

const base = API_PATHS.legislative.sessoes;

export const sessoesApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        apiList<unknown>(base, params),

    getById: (id: string) => api<unknown>(`${base}/${id}`),

    create: (body: Record<string, unknown>) =>
        api(base, { method: 'POST', body: JSON.stringify(body) }),

    update: (id: string, body: Record<string, unknown>) =>
        api(`${base}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

    addPautaItem: (sessaoId: string, body: Record<string, unknown>) =>
        api(`${base}/${sessaoId}/pauta`, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    registrarPresenca: (sessaoId: string, body: Record<string, unknown>) =>
        api(`${base}/${sessaoId}/presencas`, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    abrirVotacao: (
        sessaoId: string,
        pautaItemId: string,
        body: Record<string, unknown>,
    ) =>
        api(`${base}/${sessaoId}/pauta/${pautaItemId}/votacao`, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    registrarVoto: (
        sessaoId: string,
        pautaItemId: string,
        body: Record<string, unknown>,
    ) =>
        api(`${base}/${sessaoId}/pauta/${pautaItemId}/votacao/votos`, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    finalizarVotacao: (
        sessaoId: string,
        pautaItemId: string,
        body: Record<string, unknown>,
    ) =>
        api(`${base}/${sessaoId}/pauta/${pautaItemId}/votacao/finalizar`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),
};
