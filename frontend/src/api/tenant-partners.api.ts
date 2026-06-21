import { api, apiList } from './client';
import { API_PATHS } from './paths';

export interface TenantPartnerUsuario {
    nome: string;
    cpf: string;
    fotoPerfil?: string | null;
}

export interface TenantPartner {
    id: string;
    nome: string;
    cargo?: string;
    instituicao?: string;
    cpf?: string; // CPF ou CNPJ (somente dígitos)
    email?: string;
    telefone?: string;
    registro?: string;
    partido?: string;
    uf?: string;
    usuarioVinculado?: boolean;
    usuario?: TenantPartnerUsuario | null;
    createdAt?: string;
}

export interface CreateTenantPartnerDto {
    nome: string;
    cargo?: string;
    instituicao?: string;
    cpf?: string; // CPF ou CNPJ (somente dígitos)
    email?: string;
    telefone?: string;
    registro?: string;
    partido?: string;
    uf?: string;
}

export interface ProvisionTenantPartnerUserDto {
    nome: string;
    cpf: string;
    fotoPerfil?: string;
}

export interface UpdateTenantPartnerUserDto {
    nome?: string;
    cpf?: string;
    fotoPerfil?: string;
}

export interface TenantPartnerFiltros {
    nome?: string;
    page?: number;
    limit?: number;
}

export const tenantPartnersApi = {
    list: (filtros?: TenantPartnerFiltros) =>
        apiList<TenantPartner>(API_PATHS.tenantPartners, filtros as Record<string, string | number | boolean | undefined>),

    getById: (id: string) =>
        api<TenantPartner>(`${API_PATHS.tenantPartners}/${id}`),

    create: (dto: CreateTenantPartnerDto) =>
        api<TenantPartner>(API_PATHS.tenantPartners, { method: 'POST', body: JSON.stringify(dto) }),

    update: (id: string, dto: Partial<CreateTenantPartnerDto>) =>
        api<TenantPartner>(`${API_PATHS.tenantPartners}/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),

    provisionUser: (id: string, dto: ProvisionTenantPartnerUserDto) =>
        api<TenantPartner>(API_PATHS.tenantPartnerUsuario(id), {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    updateUser: (id: string, dto: UpdateTenantPartnerUserDto) =>
        api<TenantPartner>(API_PATHS.tenantPartnerUsuario(id), {
            method: 'PATCH',
            body: JSON.stringify(dto),
        }),

    removeUser: (id: string) =>
        api<TenantPartner>(API_PATHS.tenantPartnerUsuario(id), { method: 'DELETE' }),

    remove: (id: string) =>
        api<void>(`${API_PATHS.tenantPartners}/${id}`, { method: 'DELETE' }),
};
