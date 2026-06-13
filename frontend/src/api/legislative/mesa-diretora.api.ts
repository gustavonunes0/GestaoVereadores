import { api, apiList } from '../client';
import { API_PATHS } from '../paths';

export type BoardRole = { id: string; name: string };

export type BoardMember = {
    id: string;
    parliamentarian: {
        id: string;
        parliamentaryName: string;
        officeNumber?: string | null;
    };
    boardRole: BoardRole;
};

export type Board = {
    id: string;
    name: string;
    legislatureId: string;
    legislature?: { id: string; number: number };
    startDate: string;
    endDate?: string;
    status: string;
    notes?: string;
    members: BoardMember[];
};

export type CreateBoardInput = {
    name: string;
    legislatureId: string;
    startDate: string;
    endDate?: string;
    status?: string;
    notes?: string;
};

export const mesaDiretoraApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        apiList<Board>(API_PATHS.legislative.mesaDiretora, params),

    getById: (id: string) =>
        api<Board>(`${API_PATHS.legislative.mesaDiretora}/${id}`),

    create: (body: CreateBoardInput) =>
        api<Board>(API_PATHS.legislative.mesaDiretora, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    listCargos: () =>
        api<BoardRole[]>(`${API_PATHS.legislative.mesaDiretora}/cargos`),

    addMembro: (
        boardId: string,
        body: { parliamentarianId: string; boardRoleId: string },
    ) =>
        api(`${API_PATHS.legislative.mesaDiretora}/${boardId}/membros`, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    removeMembro: (boardId: string, membroId: string) =>
        api(
            `${API_PATHS.legislative.mesaDiretora}/${boardId}/membros/${membroId}`,
            { method: 'DELETE' },
        ),
};
