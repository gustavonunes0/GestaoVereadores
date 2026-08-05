import { resolveMateriaTextoOriginalUrl } from './materiaDisplay';

/** Resolve a logo do tenant (data URL, URL absoluta ou path /uploads). */
export function resolveTenantLogoUrl(logo: string | null | undefined): string | null {
    if (!logo?.trim()) return null;
    const trimmed = logo.trim();
    if (trimmed.startsWith('data:')) return trimmed;
    return resolveMateriaTextoOriginalUrl(trimmed);
}
