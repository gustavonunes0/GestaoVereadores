import { SetMetadata } from '@nestjs/common';

export const SKIP_TENANT_KEY = 'skipTenant';

/** Rotas de plataforma (tenants, users, auth) — não exigem `tid` no JWT. */
export const SkipTenant = () => SetMetadata(SKIP_TENANT_KEY, true);
