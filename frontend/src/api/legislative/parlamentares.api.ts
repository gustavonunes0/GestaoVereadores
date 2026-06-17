import { api, apiList } from '../client';
import { API_PATHS } from '../paths';

export type Parliamentarian = {
    id: string;
    parliamentaryName: string;
    officeNumber?: string;
    photoUrl?: string;
    biography?: string;
    status: string;
    hasAccess: boolean;
    user?: {
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
    activeMandate?: { id: string; status: string };
    stats?: {
        authoredMattersCount: number;
        coauthoredMattersCount: number;
        committeeMembersCount: number;
        sessionVotesCount: number;
    };
    committees?: Array<{ id: string; name: string; acronym?: string }>;
};

export type ParliamentarianProfile = {
    id: string;
    parliamentaryName: string;
    officeNumber?: string;
    photoUrl?: string;
    biography?: string;
    status: string;
    nomeCompleto?: string;
    email?: string;
    partido?: {
        id: string;
        nome: string;
        sigla: string;
        flagUrl?: string;
    };
    mandatos: Array<{
        id: string;
        legislaturaNumero: number;
        startedAt: string;
        endedAt?: string;
        status: string;
    }>;
    comissoes: Array<{
        id: string;
        nome: string;
        sigla?: string;
    }>;
    frentes: Array<{
        id: string;
        nome: string;
    }>;
};

export type CreateParliamentarianInput = {
    cpf: string;
    password: string;
    politicalPartyId?: string;
    parliamentaryName: string;
    officeNumber?: string;
    photoUrl?: string;
    biography?: string;
};

export type UpdateParliamentarianInput = Partial<
    Omit<CreateParliamentarianInput, 'cpf' | 'password'>
>;

export const parlamentaresApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        apiList<Parliamentarian>(API_PATHS.parlamentares, params),

    getById: (id: string) =>
        api<Parliamentarian>(`${API_PATHS.parlamentares}/${id}`),

    meuPerfil: () =>
        api<ParliamentarianProfile>(`${API_PATHS.parlamentares}/me/perfil`),

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
