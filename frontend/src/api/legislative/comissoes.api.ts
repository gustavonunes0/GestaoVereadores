import { api, apiList } from '../client';
import { API_PATHS } from '../paths';

export type CommitteeType = 'PERMANENT' | 'TEMPORARY';
export type CommitteeStatus = 'ACTIVE' | 'INACTIVE' | 'FINISHED';

export type Committee = {
    id: string;
    name: string;
    acronym?: string;
    type: CommitteeType;
    purpose: string;
    startDate?: string;
    endDate?: string;
    status: CommitteeStatus;
    notes?: string;
    members?: CommitteeMember[];
};

export type CommitteeMember = {
    id: string;
    role: string;
    roleLabel: string;
    parliamentarian: {
        id: string;
        parliamentaryName: string;
        officeNumber?: string | null;
    };
};

export type CommitteeInput = {
    name: string;
    acronym?: string;
    type: CommitteeType;
    purpose: string;
    startDate?: string;
    endDate?: string;
    status?: CommitteeStatus;
    notes?: string;
};

export const comissoesApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        apiList<Committee>(API_PATHS.legislative.comissoes, params),

    getById: (id: string) =>
        api<Committee>(`${API_PATHS.legislative.comissoes}/${id}`),

    create: (body: CommitteeInput) =>
        api<Committee>(API_PATHS.legislative.comissoes, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    update: (id: string, body: Partial<CommitteeInput>) =>
        api<Committee>(`${API_PATHS.legislative.comissoes}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),

    remove: (id: string) =>
        api<void>(`${API_PATHS.legislative.comissoes}/${id}`, {
            method: 'DELETE',
        }),
};
