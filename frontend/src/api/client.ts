import type { AuthUser, LoginRequest, LoginResponse } from '../types/auth';
import { API_PATHS } from './paths';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
    ) {
        super(message);
    }
}

function getToken(): string | null {
    return localStorage.getItem('access_token');
}

export type PaginatedMeta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type PaginatedResponse<T> = {
    data: T[];
    meta: PaginatedMeta;
};

export async function api<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
        }
        throw new ApiError('Não autorizado', 401);
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg =
            (body as { message?: string | string[] }).message ??
            `Erro ${res.status}`;
        throw new ApiError(
            Array.isArray(msg) ? msg.join(', ') : String(msg),
            res.status,
        );
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

/** Lista paginada da API (padrão limit=100). */
export async function apiList<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
): Promise<PaginatedResponse<T>> {
    const qs = new URLSearchParams();
    qs.set('limit', String(params?.limit ?? 100));
    if (params?.page) qs.set('page', String(params.page));
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (key === 'limit' || key === 'page' || value === undefined || value === '')
                continue;
            qs.set(key, String(value));
        }
    }
    const sep = path.includes('?') ? '&' : '?';
    return api<PaginatedResponse<T>>(`${path}${sep}${qs.toString()}`);
}

export async function apiTotal(path: string): Promise<number> {
    const res = await apiList<unknown>(path, { limit: 1, page: 1 });
    return res.meta.total;
}

export async function apiFormData<T>(
    path: string,
    formData: FormData,
    method: 'POST' | 'PATCH' = 'POST',
): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { method, headers, body: formData });

    if (res.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
        }
        throw new ApiError('Não autorizado', 401);
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg =
            (body as { message?: string | string[] }).message ?? `Erro ${res.status}`;
        throw new ApiError(
            Array.isArray(msg) ? msg.join(', ') : String(msg),
            res.status,
        );
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

export const authApi = {
    login: (dto: LoginRequest): Promise<LoginResponse> =>
        api(API_PATHS.authLogin, {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    me: (): Promise<AuthUser> => api(API_PATHS.authMe),
};

export type { AuthUser } from '../types/auth';
