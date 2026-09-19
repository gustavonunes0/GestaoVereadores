import { api, apiList, ApiError } from '../client';
import { API_PATHS } from '../paths';
import type {
    ParliamentarianFull,
    ParlamentarianUser,
    UserResumo,
    CreateParlamentarianDto,
    CreateParlamentarianUserDto,
    UpdateParlamentarianUserDto,
} from '../../types/parlamentares';

export type {
    ParliamentarianFull,
    ParlamentarianUser,
    UserResumo,
    CreateParlamentarianDto,
    CreateParlamentarianUserDto,
    UpdateParlamentarianUserDto,
};

export type Parliamentarian = {
    id: string;
    parliamentaryName: string;
    officeNumber?: string;
    photoUrl?: string;
    biography?: string;
    status: string;
    hasAccess: boolean;
    accessStatus?: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        cpf: string;
        politicalParty?: {
            id: string;
            name: string;
            acronym: string;
            flagUrl?: string;
        };
    };
    activeMandatesCount?: number;
    activeMandate?: {
        id: string;
        status: string;
        condicao?: string;
        legislatureId?: string;
    };
    stats?: {
        authoredMattersCount: number;
        coauthoredMattersCount: number;
        committeeMembersCount: number;
        sessionVotesCount: number;
    };
    committees?: Array<{ id: string; name: string; acronym?: string }>;
};

export type ParlamentarMandato = {
    id: string;
    parliamentarianId: string;
    legislatureId: string;
    legislature: {
        id: string;
        number: number;
        startDate: string;
        endDate?: string;
        isCurrent: boolean;
    };
    partyAcronym?: string | null;
    partyName?: string | null;
    condicao?: 'TITULAR' | 'SUPLENTE';
    titularAfastadoId?: string;
    startedAt: string;
    endedAt?: string;
    status: string;
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
    email?: string;
    politicalPartyId?: string;
    parliamentaryName: string;
    officeNumber?: string;
    photoUrl?: string;
    biography?: string;
};

export type UpdateParliamentarianInput = {
    parliamentaryName?: string;
    officeNumber?: string;
    photoUrl?: string | null;
    biography?: string;
    politicalPartyId?: string | null;
    status?: string;
    password?: string;
    legislatureId?: string;
    condicao?: 'TITULAR' | 'SUPLENTE';
    titularAfastadoId?: string | null;
};

export const parlamentaresApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        apiList<Parliamentarian>(API_PATHS.parlamentares, params),

    /**
     * Parlamentares ACTIVE. Com `legislatureId`, prefere filtro no servidor;
     * se a API ainda não aceitar o query param (400), faz fallback e filtra no cliente.
     */
    listActiveAll: async (params?: {
        legislatureId?: string;
    }): Promise<Parliamentarian[]> => {
        const legislatureId = params?.legislatureId;

        const fetchPages = async (queryLegislatureId?: string) => {
            const all: Parliamentarian[] = [];
            let page = 1;
            let totalPages = 1;
            do {
                const res = await apiList<Parliamentarian>(API_PATHS.parlamentares, {
                    status: 'ACTIVE',
                    limit: 100,
                    page,
                    ...(queryLegislatureId
                        ? { legislatureId: queryLegislatureId }
                        : {}),
                });
                all.push(...res.data);
                totalPages = res.meta.totalPages;
                page += 1;
            } while (page <= totalPages);
            return all;
        };

        const filterByMandate = (items: Parliamentarian[]) =>
            items.filter((p) => {
                if (!p.activeMandate || p.activeMandate.status !== 'ACTIVE') {
                    return false;
                }
                const mandateLeg = p.activeMandate.legislatureId;
                if (legislatureId && mandateLeg) {
                    return mandateLeg === legislatureId;
                }
                return true;
            });

        if (legislatureId) {
            try {
                return await fetchPages(legislatureId);
            } catch (err) {
                // API antiga rejeita legislatureId (forbidNonWhitelisted) → fallback.
                if (!(err instanceof ApiError) || err.status !== 400) {
                    throw err;
                }
            }

            const all = filterByMandate(await fetchPages());
            const verified = await Promise.all(
                all.map(async (p) => {
                    if (p.activeMandate?.legislatureId === legislatureId) {
                        return p;
                    }
                    try {
                        const mandatos = await apiList<ParlamentarMandato>(
                            API_PATHS.parlamentarMandatos(p.id),
                            { limit: 50 },
                        );
                        const ok = mandatos.data.some(
                            (m) =>
                                m.status === 'ACTIVE' &&
                                m.legislatureId === legislatureId,
                        );
                        return ok ? p : null;
                    } catch {
                        return null;
                    }
                }),
            );
            return verified.filter((p): p is Parliamentarian => p != null);
        }

        return filterByMandate(await fetchPages());
    },

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

    listMandatos: (id: string) =>
        apiList<ParlamentarMandato>(API_PATHS.parlamentarMandatos(id), { limit: 50 }),

    createMandato: (
        parliamentarianId: string,
        body: {
            legislatureId: string;
            startedAt?: string;
            partyAcronym?: string;
            partyName?: string;
            condicao?: 'TITULAR' | 'SUPLENTE';
            titularAfastadoId?: string | null;
        },
    ) =>
        api<unknown>(API_PATHS.parlamentarMandatos(parliamentarianId), {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    revokeAccess: (parliamentarianId: string) =>
        api<Parliamentarian>(API_PATHS.parlamentarAcesso(parliamentarianId), {
            method: 'DELETE',
        }),

    grantAccess: (parliamentarianId: string, body: { userId: string }) =>
        api<Parliamentarian>(API_PATHS.parlamentarAcesso(parliamentarianId), {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    /** @deprecated Backend ainda não expõe parliamentarianUsers[] — use getById */
    getByIdFull: (id: string) =>
        api<ParliamentarianFull>(API_PATHS.parlamentarById(id)),

    createFull: (dto: CreateParlamentarianDto) =>
        api<ParliamentarianFull>(API_PATHS.parlamentares, {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    listUsers: (parliamentarianId: string) =>
        api<ParlamentarianUser[]>(API_PATHS.parlamentarUsers(parliamentarianId)),

    createUser: (parliamentarianId: string, dto: CreateParlamentarianUserDto) =>
        api<ParlamentarianUser>(API_PATHS.parlamentarUsers(parliamentarianId), {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    updateUser: (parliamentarianId: string, userId: string, dto: UpdateParlamentarianUserDto) =>
        api<ParlamentarianUser>(API_PATHS.parlamentarUserById(parliamentarianId, userId), {
            method: 'PATCH',
            body: JSON.stringify(dto),
        }),

    searchUsers: (busca: string) =>
        apiList<UserResumo>(API_PATHS.usuariosBusca, { busca, limit: 20 }),

    /** Vereadores com usuário ativo — tenta endpoint dedicado; fallback via listagem. */
    listUsuariosAtivos: async (): Promise<
        Array<{ parliamentarianId: string; parliamentaryName: string; userNome: string }>
    > => {
        try {
            const res = await api<
                Array<{ parliamentarianId: string; parliamentaryName: string; user: { nome: string } }>
            >(API_PATHS.parlamentarianUsersAtivos);
            return res.map((item) => ({
                parliamentarianId: item.parliamentarianId,
                parliamentaryName: item.parliamentaryName,
                userNome: item.user?.nome ?? '',
            }));
        } catch {
            const res = await apiList<Parliamentarian>(API_PATHS.parlamentares, {
                status: 'ACTIVE',
                limit: 200,
            });
            return res.data
                .filter((p) => p.user)
                .map((p) => ({
                    parliamentarianId: p.id,
                    parliamentaryName: p.parliamentaryName,
                    userNome: `${p.user!.firstName} ${p.user!.lastName}`.trim(),
                }));
        }
    },
};
