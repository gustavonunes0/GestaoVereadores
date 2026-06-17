import { api, apiList } from './client';
import { API_PATHS } from './paths';

export type TenantStaffRole = 'ADMIN_STAFF' | 'STAFF';

export type TenantStaffUser = {
    id: string;
    userId: string;
    cpf: string;
    email: string;
    nome: string;
    role: TenantStaffRole;
    ativo: boolean;
    createdAt?: string;
};

export type ConvidarUsuarioInput = {
    cpf: string;
    password: string;
    nome: string;
    email?: string;
    role: TenantStaffRole;
};

export type UpdateUsuarioInput = {
    nome?: string;
    role?: TenantStaffRole;
    ativo?: boolean;
};

export const usuariosApi = {
    list: (params?: { page?: number; limit?: number }) =>
        apiList<TenantStaffUser>(API_PATHS.usuarios, params),

    convidar: (body: ConvidarUsuarioInput) =>
        api<TenantStaffUser>(`${API_PATHS.usuarios}/convidar`, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    update: (id: string, body: UpdateUsuarioInput) =>
        api<TenantStaffUser>(`${API_PATHS.usuarios}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),
};
