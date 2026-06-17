import type { PaginatedMeta, PaginatedResponse } from './client';
import { ApiError } from './client';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

/** Cliente HTTP para rotas públicas — sem redirect em 401. */
export async function publicApi<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };
    const hasBody =
        options.body !== undefined &&
        options.body !== null &&
        options.body !== '';
    if (hasBody && !headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

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

export async function publicApiList<T>(
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
    return publicApi<PaginatedResponse<T>>(`${path}${sep}${qs.toString()}`);
}

export type { PaginatedMeta, PaginatedResponse };
