import { SetMetadata } from '@nestjs/common';

export const PLATFORM_ADMIN_KEY = 'platformAdmin';

/** Exige sessão `sessionType: 'platform'` (super admin SaaS). */
export const PlatformOnly = () => SetMetadata(PLATFORM_ADMIN_KEY, true);
